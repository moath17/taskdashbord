// Analytics Service - Read-Only Data Analysis
// This service ONLY reads data, never modifies it

import { db } from '../models/database';
import { Task, AnnualGoal, MBOGoal, User } from '../types';
import {
  GoalRiskAnalysis,
  RiskLevel,
  RiskFactors,
  AnalyticsDashboard,
  UserWorkloadAnalysis
} from './analytics.types';

const MAX_RECOMMENDED_TASKS = 10; // Per user, configurable

// ============================================
// RISK SCORE CALCULATION
// ============================================

function calculateRiskScore(factors: RiskFactors): number {
  // Risk Score Formula (0-100):
  // (1 - progressRatio) * 30 + overdueTasksRatio * 25 + timePressureRatio * 25 + workloadRatio * 20
  
  const progressComponent = (1 - factors.progressRatio) * 30;
  const overdueComponent = factors.overdueTasksRatio * 25;
  const timeComponent = factors.timePressureRatio * 25;
  const workloadComponent = factors.workloadRatio * 20;
  
  const score = progressComponent + overdueComponent + timeComponent + workloadComponent;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 39) return 'LOW';
  if (score <= 69) return 'MEDIUM';
  return 'HIGH';
}

// ============================================
// DATE UTILITIES
// ============================================

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

// ============================================
// PREDICTION LOGIC
// ============================================

function calculateCompletionProbability(
  completedTasks: number,
  totalTasks: number,
  daysPassed: number,
  daysRemaining: number
): number {
  if (totalTasks === 0) return 100;
  if (daysRemaining <= 0) {
    return completedTasks >= totalTasks ? 100 : 0;
  }

  const remainingTasks = totalTasks - completedTasks;
  if (remainingTasks === 0) return 100;

  // Current velocity = tasks per day
  const currentVelocity = daysPassed > 0 ? completedTasks / daysPassed : 0;
  
  // Required velocity = remaining tasks / remaining days
  const requiredVelocity = remainingTasks / daysRemaining;

  if (requiredVelocity === 0) return 100;
  
  const probability = (currentVelocity / requiredVelocity) * 100;
  return Math.min(100, Math.max(0, Math.round(probability)));
}

function predictCompletionDate(
  completedTasks: number,
  totalTasks: number,
  daysPassed: number,
  startDate: Date
): Date | null {
  if (totalTasks === 0 || completedTasks >= totalTasks) return new Date();
  
  const currentVelocity = daysPassed > 0 ? completedTasks / daysPassed : 0;
  if (currentVelocity === 0) return null; // Can't predict
  
  const remainingTasks = totalTasks - completedTasks;
  const daysNeeded = remainingTasks / currentVelocity;
  
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + Math.ceil(daysNeeded));
  return predictedDate;
}

// ============================================
// RISK REASONS GENERATOR
// ============================================

function generateRiskReasons(
  factors: RiskFactors,
  tasksAnalysis: GoalRiskAnalysis['tasksAnalysis'],
  daysRemaining: number
): string[] {
  const reasons: string[] = [];

  if (factors.overdueTasksRatio > 0.3) {
    reasons.push(`High number of overdue tasks (${tasksAnalysis.overdue} of ${tasksAnalysis.total})`);
  }
  
  if (factors.progressRatio < 0.3 && factors.timePressureRatio > 0.5) {
    reasons.push('Low progress with more than half the time elapsed');
  }
  
  if (factors.timePressureRatio > 0.8) {
    reasons.push(`Critical: Only ${daysRemaining} days remaining`);
  }
  
  if (factors.workloadRatio > 0.8) {
    reasons.push('Assigned user has high workload');
  }
  
  if (tasksAnalysis.delayed > 0) {
    reasons.push(`${tasksAnalysis.delayed} tasks are marked as delayed`);
  }

  if (factors.progressRatio === 0 && tasksAnalysis.total > 0) {
    reasons.push('No tasks have been completed yet');
  }

  return reasons;
}

function generateRecommendations(
  riskLevel: RiskLevel,
  factors: RiskFactors,
  tasksAnalysis: GoalRiskAnalysis['tasksAnalysis']
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'HIGH') {
    recommendations.push('Immediate attention required');
    
    if (factors.overdueTasksRatio > 0.3) {
      recommendations.push('Prioritize completing overdue tasks');
    }
    
    if (factors.workloadRatio > 0.8) {
      recommendations.push('Consider redistributing tasks to other team members');
    }
    
    recommendations.push('Schedule a progress review meeting');
  }
  
  if (riskLevel === 'MEDIUM') {
    recommendations.push('Monitor progress closely');
    
    if (tasksAnalysis.inProgress < tasksAnalysis.total * 0.3) {
      recommendations.push('Start working on pending tasks');
    }
  }
  
  if (riskLevel === 'LOW') {
    recommendations.push('Continue current pace');
    recommendations.push('Goal is on track for completion');
  }

  return recommendations;
}

// ============================================
// MAIN ANALYSIS FUNCTIONS
// ============================================

export async function analyzeGoalRisk(
  goal: AnnualGoal | MBOGoal,
  goalType: 'annual' | 'mbo'
): Promise<GoalRiskAnalysis> {
  const data = await db.read();
  
  // Get tasks linked to this goal
  const goalTasks = data.tasks.filter(task => 
    goalType === 'annual' 
      ? task.annualGoalId === goal.id 
      : task.mboGoalId === goal.id
  );

  // Task analysis
  const tasksAnalysis = {
    total: goalTasks.length,
    completed: goalTasks.filter(t => t.status === 'Completed').length,
    inProgress: goalTasks.filter(t => t.status === 'In Progress').length,
    delayed: goalTasks.filter(t => t.status === 'Delayed').length,
    overdue: goalTasks.filter(t => 
      t.status !== 'Completed' && isOverdue(t.dueDate)
    ).length
  };

  // Timeline calculation
  const taskDates = goalTasks
    .filter(t => t.startDate && t.dueDate)
    .map(t => ({
      start: new Date(t.startDate),
      end: new Date(t.dueDate)
    }));

  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let daysPassed = 0;
  let daysRemaining = 0;
  let totalDays = 0;

  if (taskDates.length > 0) {
    startDate = new Date(Math.min(...taskDates.map(d => d.start.getTime())));
    endDate = new Date(Math.max(...taskDates.map(d => d.end.getTime())));
    totalDays = daysBetween(startDate, endDate);
    daysPassed = Math.max(0, daysBetween(startDate, now));
    daysRemaining = Math.max(0, daysBetween(now, endDate));
  }

  // Get user workload
  const userId = goal.userId;
  const userTasks = data.tasks.filter(t => t.assignedTo === userId && t.status !== 'Completed');
  const workloadRatio = Math.min(1, userTasks.length / MAX_RECOMMENDED_TASKS);

  // Calculate risk factors
  const factors: RiskFactors = {
    progressRatio: tasksAnalysis.total > 0 
      ? tasksAnalysis.completed / tasksAnalysis.total 
      : 1,
    overdueTasksRatio: tasksAnalysis.total > 0 
      ? tasksAnalysis.overdue / tasksAnalysis.total 
      : 0,
    timePressureRatio: totalDays > 0 
      ? Math.min(1, daysPassed / totalDays) 
      : 0,
    workloadRatio
  };

  // Calculate risk score
  const riskScore = calculateRiskScore(factors);
  const riskLevel = getRiskLevel(riskScore);

  // Prediction
  const completionProbability = calculateCompletionProbability(
    tasksAnalysis.completed,
    tasksAnalysis.total,
    daysPassed,
    daysRemaining
  );
  const expectedCompletionDate = predictCompletionDate(
    tasksAnalysis.completed,
    tasksAnalysis.total,
    daysPassed,
    startDate || now
  );

  return {
    goalId: goal.id,
    goalTitle: goal.title,
    goalType,
    riskScore,
    riskLevel,
    prediction: {
      completionProbability,
      expectedCompletionDate: expectedCompletionDate?.toISOString().split('T')[0] || null,
      isOnTrack: completionProbability >= 60
    },
    factors,
    reasons: generateRiskReasons(factors, tasksAnalysis, daysRemaining),
    recommendations: generateRecommendations(riskLevel, factors, tasksAnalysis),
    tasksAnalysis,
    timeline: {
      startDate: startDate?.toISOString().split('T')[0] || null,
      endDate: endDate?.toISOString().split('T')[0] || null,
      daysRemaining,
      daysPassed,
      totalDays
    }
  };
}

export async function getAllGoalsRisk(): Promise<GoalRiskAnalysis[]> {
  const data = await db.read();
  const analyses: GoalRiskAnalysis[] = [];

  // Analyze Annual Goals
  for (const goal of data.annualGoals) {
    analyses.push(await analyzeGoalRisk(goal, 'annual'));
  }

  // Analyze MBO Goals
  for (const goal of data.mboGoals) {
    analyses.push(await analyzeGoalRisk(goal, 'mbo'));
  }

  return analyses.sort((a, b) => b.riskScore - a.riskScore);
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const data = await db.read();
  const allRisks = await getAllGoalsRisk();

  // Summary calculations
  const totalGoals = allRisks.length;
  const goalsAtRisk = allRisks.filter(r => r.riskLevel === 'HIGH').length;
  const averageRiskScore = totalGoals > 0 
    ? Math.round(allRisks.reduce((sum, r) => sum + r.riskScore, 0) / totalGoals)
    : 0;

  // Risk distribution
  const riskDistribution = {
    low: allRisks.filter(r => r.riskLevel === 'LOW').length,
    medium: allRisks.filter(r => r.riskLevel === 'MEDIUM').length,
    high: allRisks.filter(r => r.riskLevel === 'HIGH').length
  };

  // Top 5 risks
  const topRisks = allRisks.slice(0, 5);

  // Upcoming deadlines (next 14 days)
  const now = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const upcomingDeadlines = allRisks
    .filter(r => r.timeline.endDate)
    .map(r => ({
      goalId: r.goalId,
      goalTitle: r.goalTitle,
      dueDate: r.timeline.endDate!,
      daysRemaining: r.timeline.daysRemaining,
      riskLevel: r.riskLevel
    }))
    .filter(d => {
      const dueDate = new Date(d.dueDate);
      return dueDate >= now && dueDate <= twoWeeksLater;
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10);

  // Velocity metrics
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const tasksCompletedThisWeek = data.tasks.filter(t => 
    t.status === 'Completed' && 
    new Date(t.updatedAt) >= oneWeekAgo
  ).length;

  const tasksCompletedLastWeek = data.tasks.filter(t => 
    t.status === 'Completed' && 
    new Date(t.updatedAt) >= twoWeeksAgo &&
    new Date(t.updatedAt) < oneWeekAgo
  ).length;

  let velocityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (tasksCompletedThisWeek > tasksCompletedLastWeek * 1.2) {
    velocityTrend = 'increasing';
  } else if (tasksCompletedThisWeek < tasksCompletedLastWeek * 0.8) {
    velocityTrend = 'decreasing';
  }

  // Average task completion time (simplified)
  const completedTasks = data.tasks.filter(t => t.status === 'Completed');
  let averageTaskCompletionTime = 0;
  if (completedTasks.length > 0) {
    const completionTimes = completedTasks.map(t => 
      daysBetween(new Date(t.startDate), new Date(t.updatedAt))
    ).filter(d => d > 0);
    
    if (completionTimes.length > 0) {
      averageTaskCompletionTime = Math.round(
        completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      );
    }
  }

  return {
    summary: {
      totalGoals,
      goalsAtRisk,
      averageRiskScore,
      overallHealthStatus: getRiskLevel(averageRiskScore)
    },
    riskDistribution,
    topRisks,
    upcomingDeadlines,
    velocityMetrics: {
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      velocityTrend,
      averageTaskCompletionTime
    }
  };
}

export async function getUserWorkloadAnalysis(): Promise<UserWorkloadAnalysis[]> {
  const data = await db.read();
  const analyses: UserWorkloadAnalysis[] = [];

  for (const user of data.users) {
    const userTasks = data.tasks.filter(t => t.assignedTo === user.id);
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = userTasks.filter(t => 
      t.status !== 'Completed' && isOverdue(t.dueDate)
    ).length;
    const activeTasks = userTasks.filter(t => t.status !== 'Completed').length;

    const workloadScore = Math.min(100, Math.round((activeTasks / MAX_RECOMMENDED_TASKS) * 100));
    
    let workloadStatus: 'underloaded' | 'optimal' | 'overloaded' = 'optimal';
    if (workloadScore < 30) workloadStatus = 'underloaded';
    else if (workloadScore > 80) workloadStatus = 'overloaded';

    // Count goals at risk for this user
    const userGoalIds = new Set([
      ...data.annualGoals.filter(g => g.userId === user.id).map(g => g.id),
      ...data.mboGoals.filter(g => g.userId === user.id).map(g => g.id)
    ]);

    const allRisks = await getAllGoalsRisk();
    const goalsAtRisk = allRisks.filter(r => 
      userGoalIds.has(r.goalId) && r.riskLevel === 'HIGH'
    ).length;

    analyses.push({
      userId: user.id,
      userName: user.name,
      totalAssignedTasks: userTasks.length,
      completedTasks,
      overdueTasks,
      workloadScore,
      workloadStatus,
      goalsAtRisk
    });
  }

  return analyses.sort((a, b) => b.workloadScore - a.workloadScore);
}


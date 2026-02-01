import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Calculate risk score for a goal
function calculateRiskScore(tasks: any[], daysRemaining: number, totalDays: number): number {
  if (tasks.length === 0) return 30; // Low risk if no tasks
  
  const completedCount = tasks.filter((t: any) => t.status === 'Completed').length;
  const delayedCount = tasks.filter((t: any) => t.status === 'Delayed').length;
  const overdueCount = tasks.filter((t: any) => {
    const dueDate = new Date(t.dueDate);
    return dueDate < new Date() && t.status !== 'Completed';
  }).length;
  
  const progressRatio = completedCount / tasks.length;
  const expectedProgress = totalDays > 0 ? (totalDays - daysRemaining) / totalDays : 0;
  const progressDelta = expectedProgress - progressRatio;
  
  let riskScore = 0;
  
  // Progress behind schedule
  if (progressDelta > 0) {
    riskScore += progressDelta * 50;
  }
  
  // Delayed tasks penalty
  riskScore += (delayedCount / tasks.length) * 30;
  
  // Overdue tasks penalty
  riskScore += (overdueCount / tasks.length) * 40;
  
  // Time pressure
  if (daysRemaining <= 7 && progressRatio < 0.8) {
    riskScore += 20;
  } else if (daysRemaining <= 14 && progressRatio < 0.6) {
    riskScore += 15;
  }
  
  return Math.min(100, Math.max(0, Math.round(riskScore)));
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score <= 39) return 'LOW';
  if (score <= 69) return 'MEDIUM';
  return 'HIGH';
}

// Get analytics dashboard
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    const usersDb = getUsersDb();
    
    const tasks = await db.tasks.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    const mboGoals = await db.mboGoals.getByOrganization(user.organizationId);
    
    // Analyze all goals
    const goalAnalyses: any[] = [];
    const now = new Date();
    
    // Analyze annual goals
    for (const goal of annualGoals) {
      const goalTasks = tasks.filter((t: any) => t.annualGoalId === goal.id);
      const startDate = goal.startDate ? new Date(goal.startDate) : new Date(goal.createdAt);
      const endDate = goal.endDate ? new Date(goal.endDate) : new Date(now.getFullYear(), 11, 31);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const daysPassed = totalDays - daysRemaining;
      
      const riskScore = calculateRiskScore(goalTasks, daysRemaining, totalDays);
      const riskLevel = getRiskLevel(riskScore);
      
      const completedTasks = goalTasks.filter((t: any) => t.status === 'Completed').length;
      const inProgressTasks = goalTasks.filter((t: any) => t.status === 'In Progress').length;
      const delayedTasks = goalTasks.filter((t: any) => t.status === 'Delayed').length;
      const overdueTasks = goalTasks.filter((t: any) => {
        const dueDate = new Date(t.dueDate);
        return dueDate < now && t.status !== 'Completed';
      }).length;
      
      goalAnalyses.push({
        goalId: goal.id,
        goalTitle: goal.title,
        goalType: 'annual',
        riskScore,
        riskLevel,
        prediction: {
          completionProbability: Math.max(0, Math.min(100, 100 - riskScore)),
          expectedCompletionDate: endDate.toISOString(),
          isOnTrack: riskScore <= 39,
        },
        factors: {
          progressRatio: goalTasks.length > 0 ? completedTasks / goalTasks.length : 1,
          overdueTasksRatio: goalTasks.length > 0 ? overdueTasks / goalTasks.length : 0,
          timePressureRatio: totalDays > 0 ? daysPassed / totalDays : 0,
          workloadRatio: goalTasks.length / 10,
        },
        reasons: riskScore > 39 ? [
          overdueTasks > 0 ? `${overdueTasks} overdue task(s)` : null,
          delayedTasks > 0 ? `${delayedTasks} delayed task(s)` : null,
          daysRemaining <= 14 ? `Only ${daysRemaining} days remaining` : null,
        ].filter(Boolean) : [],
        recommendations: riskScore > 39 ? [
          'Review and prioritize pending tasks',
          'Consider reallocating resources',
          'Schedule progress review meetings',
        ] : ['Continue current pace', 'Monitor progress weekly'],
        tasksAnalysis: {
          total: goalTasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
          delayed: delayedTasks,
          overdue: overdueTasks,
        },
        timeline: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          daysRemaining,
          daysPassed,
          totalDays,
        },
        dueDate: endDate.toISOString(),
      });
    }
    
    // Analyze MBO goals similarly
    for (const goal of mboGoals) {
      const goalTasks = tasks.filter((t: any) => t.mboGoalId === goal.id);
      const startDate = goal.startDate ? new Date(goal.startDate) : new Date(goal.createdAt);
      const endDate = goal.endDate ? new Date(goal.endDate) : new Date(now.getFullYear(), 11, 31);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const daysPassed = totalDays - daysRemaining;
      
      const riskScore = calculateRiskScore(goalTasks, daysRemaining, totalDays);
      const riskLevel = getRiskLevel(riskScore);
      
      const completedTasks = goalTasks.filter((t: any) => t.status === 'Completed').length;
      const inProgressTasks = goalTasks.filter((t: any) => t.status === 'In Progress').length;
      const delayedTasks = goalTasks.filter((t: any) => t.status === 'Delayed').length;
      const overdueTasks = goalTasks.filter((t: any) => {
        const dueDate = new Date(t.dueDate);
        return dueDate < now && t.status !== 'Completed';
      }).length;
      
      goalAnalyses.push({
        goalId: goal.id,
        goalTitle: goal.title,
        goalType: 'mbo',
        riskScore,
        riskLevel,
        prediction: {
          completionProbability: Math.max(0, Math.min(100, 100 - riskScore)),
          expectedCompletionDate: endDate.toISOString(),
          isOnTrack: riskScore <= 39,
        },
        factors: {
          progressRatio: goalTasks.length > 0 ? completedTasks / goalTasks.length : 1,
          overdueTasksRatio: goalTasks.length > 0 ? overdueTasks / goalTasks.length : 0,
          timePressureRatio: totalDays > 0 ? daysPassed / totalDays : 0,
          workloadRatio: goalTasks.length / 10,
        },
        reasons: riskScore > 39 ? [
          overdueTasks > 0 ? `${overdueTasks} overdue task(s)` : null,
          delayedTasks > 0 ? `${delayedTasks} delayed task(s)` : null,
          daysRemaining <= 14 ? `Only ${daysRemaining} days remaining` : null,
        ].filter(Boolean) : [],
        recommendations: riskScore > 39 ? [
          'Review and prioritize pending tasks',
          'Consider reallocating resources',
          'Schedule progress review meetings',
        ] : ['Continue current pace', 'Monitor progress weekly'],
        tasksAnalysis: {
          total: goalTasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
          delayed: delayedTasks,
          overdue: overdueTasks,
        },
        timeline: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          daysRemaining,
          daysPassed,
          totalDays,
        },
        dueDate: endDate.toISOString(),
      });
    }
    
    // Calculate summary
    const totalGoals = goalAnalyses.length;
    const goalsAtRisk = goalAnalyses.filter(g => g.riskLevel === 'HIGH').length;
    const averageRiskScore = totalGoals > 0 
      ? Math.round(goalAnalyses.reduce((sum, g) => sum + g.riskScore, 0) / totalGoals)
      : 0;
    
    // Risk distribution
    const riskDistribution = {
      low: goalAnalyses.filter(g => g.riskLevel === 'LOW').length,
      medium: goalAnalyses.filter(g => g.riskLevel === 'MEDIUM').length,
      high: goalAnalyses.filter(g => g.riskLevel === 'HIGH').length,
    };
    
    // Top risks (sorted by risk score)
    const topRisks = goalAnalyses
      .filter(g => g.riskLevel !== 'LOW')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
    
    // Upcoming deadlines (next 14 days)
    const upcomingDeadlines = goalAnalyses
      .filter(g => g.timeline.daysRemaining <= 14 && g.timeline.daysRemaining > 0)
      .sort((a, b) => a.timeline.daysRemaining - b.timeline.daysRemaining)
      .slice(0, 8)
      .map(g => ({
        goalId: g.goalId,
        goalTitle: g.goalTitle,
        dueDate: g.dueDate,
        daysRemaining: g.timeline.daysRemaining,
        riskLevel: g.riskLevel,
      }));
    
    // Velocity metrics
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const tasksCompletedThisWeek = tasks.filter((t: any) => {
      if (t.status !== 'Completed' || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= oneWeekAgo;
    }).length;
    
    const tasksCompletedLastWeek = tasks.filter((t: any) => {
      if (t.status !== 'Completed' || !t.updatedAt) return false;
      const completedDate = new Date(t.updatedAt);
      return completedDate >= twoWeeksAgo && completedDate < oneWeekAgo;
    }).length;
    
    let velocityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (tasksCompletedThisWeek > tasksCompletedLastWeek * 1.2) {
      velocityTrend = 'increasing';
    } else if (tasksCompletedThisWeek < tasksCompletedLastWeek * 0.8) {
      velocityTrend = 'decreasing';
    }
    
    const dashboard = {
      summary: {
        totalGoals,
        goalsAtRisk,
        averageRiskScore,
        overallHealthStatus: getRiskLevel(averageRiskScore),
      },
      riskDistribution,
      topRisks,
      upcomingDeadlines,
      velocityMetrics: {
        tasksCompletedThisWeek,
        tasksCompletedLastWeek,
        velocityTrend,
        averageTaskCompletionTime: 5, // Placeholder - would need more data to calculate
      },
    };
    
    return jsonResponse(dashboard);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get analytics dashboard error:', error);
    return errorResponse('Failed to get analytics dashboard', 500);
  }
}

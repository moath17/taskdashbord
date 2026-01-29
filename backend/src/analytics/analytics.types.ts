// Analytics Module Types - Read-Only Analytics Layer

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactors {
  progressRatio: number;      // completedTasks / totalTasks
  overdueTasksRatio: number;  // overdueTasks / totalTasks
  timePressureRatio: number;  // daysPassed / totalDuration
  workloadRatio: number;      // assignedTasks / maxRecommendedTasks
}

export interface GoalRiskAnalysis {
  goalId: string;
  goalTitle: string;
  goalType: 'annual' | 'mbo';
  riskScore: number;          // 0-100
  riskLevel: RiskLevel;
  prediction: {
    completionProbability: number;  // 0-100
    expectedCompletionDate: string | null;
    isOnTrack: boolean;
  };
  factors: RiskFactors;
  reasons: string[];
  recommendations: string[];
  tasksAnalysis: {
    total: number;
    completed: number;
    inProgress: number;
    delayed: number;
    overdue: number;
  };
  timeline: {
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number;
    daysPassed: number;
    totalDays: number;
  };
}

export interface AnalyticsDashboard {
  summary: {
    totalGoals: number;
    goalsAtRisk: number;
    averageRiskScore: number;
    overallHealthStatus: RiskLevel;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  topRisks: GoalRiskAnalysis[];
  upcomingDeadlines: Array<{
    goalId: string;
    goalTitle: string;
    dueDate: string;
    daysRemaining: number;
    riskLevel: RiskLevel;
  }>;
  velocityMetrics: {
    tasksCompletedThisWeek: number;
    tasksCompletedLastWeek: number;
    velocityTrend: 'increasing' | 'stable' | 'decreasing';
    averageTaskCompletionTime: number; // in days
  };
}

export interface UserWorkloadAnalysis {
  userId: string;
  userName: string;
  totalAssignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  workloadScore: number;      // 0-100
  workloadStatus: 'underloaded' | 'optimal' | 'overloaded';
  goalsAtRisk: number;
}


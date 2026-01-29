// Analytics API Client - Read-Only Analytics Data

import api from './client';

export interface RiskFactors {
  progressRatio: number;
  overdueTasksRatio: number;
  timePressureRatio: number;
  workloadRatio: number;
}

export interface GoalRiskAnalysis {
  goalId: string;
  goalTitle: string;
  goalType: 'annual' | 'mbo';
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  prediction: {
    completionProbability: number;
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
    overallHealthStatus: 'LOW' | 'MEDIUM' | 'HIGH';
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
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  velocityMetrics: {
    tasksCompletedThisWeek: number;
    tasksCompletedLastWeek: number;
    velocityTrend: 'increasing' | 'stable' | 'decreasing';
    averageTaskCompletionTime: number;
  };
}

export interface UserWorkloadAnalysis {
  userId: string;
  userName: string;
  totalAssignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  workloadScore: number;
  workloadStatus: 'underloaded' | 'optimal' | 'overloaded';
  goalsAtRisk: number;
}

export interface AnalyticsStatus {
  enabled: boolean;
  version: string;
  features: string[];
}

// API Functions

export const getAnalyticsStatus = async (): Promise<AnalyticsStatus> => {
  const response = await api.get('/analytics/status');
  return response.data;
};

export const getAnalyticsDashboard = async (): Promise<AnalyticsDashboard> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getGoalsRisk = async (): Promise<GoalRiskAnalysis[]> => {
  const response = await api.get('/analytics/goals-risk');
  return response.data;
};

export const getGoalRisk = async (goalId: string): Promise<GoalRiskAnalysis> => {
  const response = await api.get(`/analytics/goals-risk/${goalId}`);
  return response.data;
};

export const getHighRiskGoals = async (): Promise<{ count: number; goals: GoalRiskAnalysis[] }> => {
  const response = await api.get('/analytics/high-risk');
  return response.data;
};

export const getWorkloadAnalysis = async (): Promise<UserWorkloadAnalysis[]> => {
  const response = await api.get('/analytics/workload');
  return response.data;
};

export const getPredictions = async (): Promise<Array<{
  goalId: string;
  goalTitle: string;
  goalType: 'annual' | 'mbo';
  completionProbability: number;
  expectedCompletionDate: string | null;
  isOnTrack: boolean;
  currentProgress: number;
  daysRemaining: number;
}>> => {
  const response = await api.get('/analytics/predictions');
  return response.data;
};


export type UserRole = 'manager' | 'employee';
export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type VacationType = 'Annual' | 'Sick' | 'Other';
export type PlanStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface AnnualGoal {
  id: string;
  title: string;
  description: string;
  year: number;
  userId: string;
  userName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MBOGoal {
  id: string;
  title: string;
  description: string;
  annualGoalId: string;
  annualGoalTitle?: string;
  userId: string;
  userName?: string;
  targetValue?: string;
  currentValue?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type KPIFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface KPI {
  id: string;
  title: string;
  description: string;
  annualGoalId: string;
  annualGoalTitle?: string;
  mboGoalId?: string;
  mboGoalTitle?: string;
  unit: string;
  targetValue: number; // المقام - Denominator
  currentValue: number; // البسط - Numerator
  achievementPercentage?: number;
  formula?: string;
  frequency: KPIFrequency;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  annualGoalId: string;
  mboGoalId: string;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  annualGoal?: {
    id: string;
    title: string;
  };
  mboGoal?: {
    id: string;
    title: string;
  };
  comments?: CommentWithUser[];
}

export interface Comment {
  id: string;
  taskId?: string;
  vacationPlanId?: string;
  trainingPlanId?: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
  };
}

export interface VacationPlan {
  id: string;
  userId: string;
  type: VacationType;
  startDate: string;
  endDate: string;
  notes: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  comments?: CommentWithUser[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  courseName: string;
  platform: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  notes: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  comments?: CommentWithUser[];
}

export interface DashboardStats {
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    newTasks: number;
    completionRate: number;
  };
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksPerEmployee: Array<{
    userId: string;
    userName: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    progressPercentage: number;
  }>;
  recentTasks: Task[];
  vacationPlans: VacationPlan[];
  trainingPlans: TrainingPlan[];
  overlaps: Array<{
    userId: string;
    userName: string;
    vacationId: string;
    vacationType: string;
    vacationStart: string;
    vacationEnd: string;
    trainingId: string;
    trainingName: string;
    trainingPlatform: string;
    overlapStart: string;
    overlapEnd: string;
    overlapDays: number;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'holiday' | 'training';
  startDate: string;
  endDate: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'article' | 'instruction' | 'other';
  imageUrl?: string;
  link?: string;
  isHighlighted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface WeeklyUpdate {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  importantTasks: Array<{
    taskId: string;
    title: string;
    status: TaskStatus;
    progress?: number;
  }>;
  summary: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface TaskWithUser extends Task {
  assignedUserName?: string;
}

export interface VacationPlanWithUser extends VacationPlan {
  userName?: string;
}

export interface TrainingPlanWithUser extends TrainingPlan {
  userName?: string;
}


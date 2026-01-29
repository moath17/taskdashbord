export type UserRole = 'owner' | 'manager' | 'employee';

export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export type VacationType = 'Annual' | 'Sick' | 'Other';
export type PlanStatus = 'pending' | 'approved' | 'rejected';
export type KPIFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AnnualGoal {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  year: number;
  userId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MBOGoal {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  annualGoalId: string;
  userId: string;
  targetValue?: string;
  currentValue?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  annualGoalId: string;
  mboGoalId?: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  formula?: string;
  frequency: KPIFrequency;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  organizationId: string;
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
}

export interface Comment {
  id: string;
  organizationId: string;
  taskId?: string;
  vacationPlanId?: string;
  trainingPlanId?: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface VacationPlan {
  id: string;
  organizationId: string;
  userId: string;
  type: VacationType;
  startDate: string;
  endDate: string;
  notes: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlan {
  id: string;
  organizationId: string;
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
}

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  type: 'holiday' | 'training';
  startDate: string;
  endDate: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  type: 'course' | 'article' | 'instruction' | 'other';
  imageUrl?: string;
  link?: string;
  isHighlighted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyUpdate {
  id: string;
  organizationId: string;
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
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
}

export type UserRole = 'manager' | 'employee';

export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export type VacationType = 'Annual' | 'Sick' | 'Other';
export type PlanStatus = 'pending' | 'approved' | 'rejected';
export type KPIFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AnnualGoal {
  id: string;
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
  taskId?: string;
  vacationPlanId?: string;
  trainingPlanId?: string;
  userId: string;
  content: string;
  createdAt: string;
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
}

export interface Database {
  users: User[];
  annualGoals: AnnualGoal[];
  mboGoals: MBOGoal[];
  kpis: KPI[];
  tasks: Task[];
  comments: Comment[];
  vacationPlans: VacationPlan[];
  trainingPlans: TrainingPlan[];
  calendarEvents: CalendarEvent[];
  proposals: Proposal[];
  weeklyUpdates: WeeklyUpdate[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

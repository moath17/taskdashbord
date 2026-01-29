export type UserRole = 'manager' | 'employee';

export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export type VacationType = 'Annual' | 'Sick' | 'Other';

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
  userId: string; // Employee who owns this goal
  createdBy: string; // Manager who created it
  createdAt: string;
  updatedAt: string;
}

export interface MBOGoal {
  id: string;
  title: string;
  description: string;
  annualGoalId: string; // Parent Annual Goal
  userId: string; // Employee who owns this goal
  targetValue?: string; // Target metric
  currentValue?: string; // Current progress
  createdBy: string; // Manager who created it
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  title: string;
  description: string;
  annualGoalId: string; // Linked Annual Goal
  mboGoalId?: string; // Optional: Linked MBO Goal
  unit: string; // e.g., "%", "count", "SAR", etc.
  targetValue: number; // Denominator (المقام) - The goal target
  currentValue: number; // Numerator (البسط) - Current achievement
  formula?: string; // Optional formula description
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // user id
  annualGoalId: string; // Required: linked Annual Goal
  mboGoalId: string; // Required: linked MBO Goal
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // user id
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
  status: 'pending' | 'approved' | 'rejected';
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
  status: 'pending' | 'approved' | 'rejected';
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
  createdBy: string; // user id
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
  isHighlighted: boolean; // Manager can highlight important proposals
  createdBy: string; // user id
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyUpdate {
  id: string;
  weekStartDate: string; // Start date of the week (Monday)
  weekEndDate: string; // End date of the week (Sunday)
  importantTasks: Array<{
    taskId: string;
    title: string;
    status: TaskStatus;
    progress?: number;
  }>;
  summary: string;
  createdBy: string; // user id (Manager)
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

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}


import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    let tasks = await db.tasks.getByOrganization(user.organizationId);
    const allUsers = await db.users.getByOrganization(user.organizationId);

    // Filter tasks based on role
    if (user.role === 'employee') {
      tasks = tasks.filter((t: any) => t.assignedTo === user.id);
    }

    // Task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress').length;
    const delayedTasks = tasks.filter((t: any) => {
      if (t.status === 'Completed' || t.status === 'New') return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const newTasks = tasks.filter((t: any) => t.status === 'New').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by priority
    const highPriorityTasks = tasks.filter((t: any) => t.priority === 'High').length;
    const mediumPriorityTasks = tasks.filter((t: any) => t.priority === 'Medium').length;
    const lowPriorityTasks = tasks.filter((t: any) => t.priority === 'Low').length;

    // All tasks for the org (for per-employee stats)
    const allTasks = await db.tasks.getByOrganization(user.organizationId);

    // Tasks per employee
    const tasksPerEmployee = user.role !== 'employee'
      ? allUsers.map((u: any) => {
          const userTasks = allTasks.filter((t: any) => t.assignedTo === u.id);
          const userCompleted = userTasks.filter((t: any) => t.status === 'Completed').length;
          const userProgress = userTasks.length > 0 ? (userCompleted / userTasks.length) * 100 : 0;
          return {
            userId: u.id,
            userName: u.name,
            totalTasks: userTasks.length,
            completedTasks: userCompleted,
            inProgressTasks: userTasks.filter((t: any) => t.status === 'In Progress').length,
            delayedTasks: userTasks.filter((t: any) => {
              if (t.status === 'Completed' || t.status === 'New') return false;
              return new Date(t.dueDate) < new Date();
            }).length,
            progressPercentage: userProgress,
          };
        })
      : [{
          userId: user.id,
          userName: user.name,
          totalTasks,
          completedTasks,
          inProgressTasks,
          delayedTasks,
          progressPercentage: completionRate,
        }];

    // Recent tasks
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTasks = tasks
      .filter((t: any) => new Date(t.createdAt) >= thirtyDaysAgo)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((task: any) => {
        const assignedUser = allUsers.find((u: any) => u.id === task.assignedTo);
        return { ...task, assignedUserName: assignedUser?.name || 'Unknown' };
      });

    // Vacation and training plans
    let vacationPlans = await db.vacationPlans.getByOrganization(user.organizationId);
    let trainingPlans = await db.trainingPlans.getByOrganization(user.organizationId);
    
    if (user.role === 'employee') {
      vacationPlans = vacationPlans.filter((p: any) => p.userId === user.id);
      trainingPlans = trainingPlans.filter((p: any) => p.userId === user.id);
    }

    vacationPlans = vacationPlans.map((plan: any) => {
      const planUser = allUsers.find((u: any) => u.id === plan.userId);
      return { ...plan, userName: planUser?.name || 'Unknown' };
    });

    trainingPlans = trainingPlans.map((plan: any) => {
      const planUser = allUsers.find((u: any) => u.id === plan.userId);
      return { ...plan, userName: planUser?.name || 'Unknown' };
    });

    return jsonResponse({
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        delayedTasks,
        newTasks,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      tasksByPriority: {
        high: highPriorityTasks,
        medium: mediumPriorityTasks,
        low: lowPriorityTasks,
      },
      tasksPerEmployee,
      recentTasks,
      vacationPlans,
      trainingPlans,
      overlaps: [],
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get dashboard error:', error);
    return errorResponse('Failed to get dashboard', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    await db.read();

    let tasks = [...db.data.tasks];
    let users = [...db.data.users];

    // Filter tasks based on role
    if (user.role === 'employee') {
      tasks = tasks.filter((t) => t.assignedTo === user.id);
      users = users.filter((u) => u.id === user.id);
    }

    // Task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const delayedTasks = tasks.filter((t) => {
      if (t.status === 'Completed' || t.status === 'New') return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const newTasks = tasks.filter((t) => t.status === 'New').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by priority
    const highPriorityTasks = tasks.filter((t) => t.priority === 'High').length;
    const mediumPriorityTasks = tasks.filter((t) => t.priority === 'Medium').length;
    const lowPriorityTasks = tasks.filter((t) => t.priority === 'Low').length;

    // Tasks per employee
    const tasksPerEmployee =
      user.role === 'manager'
        ? users.map((u) => {
            const userTasks = db.data.tasks.filter((t) => t.assignedTo === u.id);
            const userCompleted = userTasks.filter((t) => t.status === 'Completed').length;
            const userProgress = userTasks.length > 0 ? (userCompleted / userTasks.length) * 100 : 0;
            return {
              userId: u.id,
              userName: u.name,
              totalTasks: userTasks.length,
              completedTasks: userCompleted,
              inProgressTasks: userTasks.filter((t) => t.status === 'In Progress').length,
              delayedTasks: userTasks.filter((t) => {
                if (t.status === 'Completed' || t.status === 'New') return false;
                return new Date(t.dueDate) < new Date();
              }).length,
              progressPercentage: userProgress,
            };
          })
        : [{
            userId: user.id,
            userName: users.find((u) => u.id === user.id)?.name || 'Unknown',
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
      .filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((task) => {
        const assignedUser = db.data.users.find((u) => u.id === task.assignedTo);
        return { ...task, assignedUserName: assignedUser?.name || 'Unknown' };
      });

    // Vacation and training plans
    let vacationPlans = [];
    let trainingPlans = [];
    
    if (user.role === 'manager') {
      vacationPlans = db.data.vacationPlans.map((plan) => {
        const planUser = db.data.users.find((u) => u.id === plan.userId);
        return { ...plan, userName: planUser?.name || 'Unknown' };
      });
      trainingPlans = db.data.trainingPlans.map((plan) => {
        const planUser = db.data.users.find((u) => u.id === plan.userId);
        return { ...plan, userName: planUser?.name || 'Unknown' };
      });
    } else {
      vacationPlans = db.data.vacationPlans
        .filter((p) => p.userId === user.id)
        .map((plan) => {
          const planUser = db.data.users.find((u) => u.id === plan.userId);
          return { ...plan, userName: planUser?.name || 'Unknown' };
        });
      trainingPlans = db.data.trainingPlans
        .filter((p) => p.userId === user.id)
        .map((plan) => {
          const planUser = db.data.users.find((u) => u.id === plan.userId);
          return { ...plan, userName: planUser?.name || 'Unknown' };
        });
    }

    // Calculate overlaps
    const overlaps: any[] = [];
    const allVacations = user.role === 'manager' 
      ? db.data.vacationPlans.filter((p) => p.status === 'approved')
      : db.data.vacationPlans.filter((p) => p.userId === user.id && p.status === 'approved');
    
    const allTrainings = user.role === 'manager'
      ? db.data.trainingPlans.filter((p) => p.status === 'approved')
      : db.data.trainingPlans.filter((p) => p.userId === user.id && p.status === 'approved');

    const userIdsToCheck = user.role === 'manager'
      ? Array.from(new Set([...allVacations.map((v) => v.userId), ...allTrainings.map((t) => t.userId)]))
      : [user.id];

    userIdsToCheck.forEach((uid) => {
      const userVacations = allVacations.filter((v) => v.userId === uid);
      const userTrainings = allTrainings.filter((t) => t.userId === uid);
      const targetUser = db.data.users.find((u) => u.id === uid);

      userVacations.forEach((vacation) => {
        const vacStart = new Date(vacation.startDate);
        const vacEnd = new Date(vacation.endDate);

        userTrainings.forEach((training) => {
          if (!training.startDate || !training.endDate) return;

          const trainingStart = new Date(training.startDate);
          const trainingEnd = new Date(training.endDate);
          const overlapStart = vacStart > trainingStart ? vacStart : trainingStart;
          const overlapEnd = vacEnd < trainingEnd ? vacEnd : trainingEnd;

          if (overlapStart <= overlapEnd) {
            const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            overlaps.push({
              userId: uid,
              userName: targetUser?.name || 'Unknown',
              vacationId: vacation.id,
              vacationType: vacation.type,
              vacationStart: vacation.startDate,
              vacationEnd: vacation.endDate,
              trainingId: training.id,
              trainingName: training.courseName,
              trainingPlatform: training.platform,
              overlapStart: overlapStart.toISOString(),
              overlapEnd: overlapEnd.toISOString(),
              overlapDays,
            });
          }
        });
      });
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
      overlaps,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get dashboard', 500);
  }
}

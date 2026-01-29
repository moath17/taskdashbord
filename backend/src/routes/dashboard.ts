import express, { Request, Response } from 'express';
import { db } from '../models/database';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticate, async (req: Request, res: Response) => {
  const authReq = req as unknown as AuthRequest;
  await db.read();
  const userId = authReq.user?.id;
  const userRole = authReq.user?.role;

  let tasks = [...db.data.tasks];
  let users = [...db.data.users];

  // Filter tasks based on role
  if (userRole === 'employee') {
    tasks = tasks.filter((t) => t.assignedTo === userId);
    users = users.filter((u) => u.id === userId);
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

  // Task completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Tasks by priority
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High').length;
  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriorityTasks = tasks.filter((t) => t.priority === 'Low').length;

  // Tasks per employee (if manager)
  const tasksPerEmployee =
    userRole === 'manager'
      ? users.map((user) => {
          const userTasks = db.data.tasks.filter((t) => t.assignedTo === user.id);
          const userCompleted = userTasks.filter((t) => t.status === 'Completed').length;
          const userProgress = userTasks.length > 0 ? (userCompleted / userTasks.length) * 100 : 0;
          return {
            userId: user.id,
            userName: user.name,
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
      : [
          {
            userId: userId!,
            userName: users.find((u) => u.id === userId)?.name || 'Unknown',
            totalTasks,
            completedTasks,
            inProgressTasks,
            delayedTasks,
            progressPercentage: completionRate,
          },
        ];

  // Recent tasks timeline (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTasks = tasks
    .filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((task) => {
      const assignedUser = db.data.users.find((u) => u.id === task.assignedTo);
      return {
        ...task,
        assignedUserName: assignedUser?.name || 'Unknown',
      };
    });

  // Vacation and training plans statistics (if admin/manager)
  let vacationPlans = [];
  let trainingPlans = [];
    if (userRole === 'manager') {
    vacationPlans = db.data.vacationPlans.map((plan) => {
      const user = db.data.users.find((u) => u.id === plan.userId);
      return {
        ...plan,
        userName: user?.name || 'Unknown',
      };
    });
    trainingPlans = db.data.trainingPlans.map((plan) => {
      const user = db.data.users.find((u) => u.id === plan.userId);
      return {
        ...plan,
        userName: user?.name || 'Unknown',
      };
    });
  } else {
    vacationPlans = db.data.vacationPlans
      .filter((p) => p.userId === userId)
      .map((plan) => {
        const user = db.data.users.find((u) => u.id === plan.userId);
        return {
          ...plan,
          userName: user?.name || 'Unknown',
        };
      });
    trainingPlans = db.data.trainingPlans
      .filter((p) => p.userId === userId)
      .map((plan) => {
        const user = db.data.users.find((u) => u.id === plan.userId);
        return {
          ...plan,
          userName: user?.name || 'Unknown',
        };
      });
  }

  // Calculate overlaps between vacations and training plans
  const overlaps: Array<{
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
  }> = [];

  const allVacations = userRole === 'manager' 
    ? db.data.vacationPlans.filter((p) => p.status === 'approved')
    : db.data.vacationPlans.filter((p) => p.userId === userId && p.status === 'approved');
  
  const allTrainings = userRole === 'manager'
    ? db.data.trainingPlans.filter((p) => p.status === 'approved')
    : db.data.trainingPlans.filter((p) => p.userId === userId && p.status === 'approved');

  // Check overlaps for each user
  const userIdsToCheck = userRole === 'manager'
    ? [...new Set([...allVacations.map((v) => v.userId), ...allTrainings.map((t) => t.userId)])]
    : [userId!];

  userIdsToCheck.forEach((uid) => {
    const userVacations = allVacations.filter((v) => v.userId === uid);
    const userTrainings = allTrainings.filter((t) => t.userId === uid);
    const user = db.data.users.find((u) => u.id === uid);

    userVacations.forEach((vacation) => {
      const vacStart = new Date(vacation.startDate);
      const vacEnd = new Date(vacation.endDate);

      userTrainings.forEach((training) => {
        // Skip if training doesn't have dates
        if (!training.startDate || !training.endDate) {
          return;
        }

        const trainingStart = new Date(training.startDate);
        const trainingEnd = new Date(training.endDate);

        // Check if date ranges overlap
        const overlapStart = vacStart > trainingStart ? vacStart : trainingStart;
        const overlapEnd = vacEnd < trainingEnd ? vacEnd : trainingEnd;

        if (overlapStart <= overlapEnd) {
          const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          overlaps.push({
            userId: uid,
            userName: user?.name || 'Unknown',
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

  res.json({
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
});

export default router;


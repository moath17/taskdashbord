import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { createNotificationForUsers } from '@/lib/notifications-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get all MBO goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    
    let goals = await db.mboGoals.getByOrganization(user.organizationId);
    
    if (user.role === 'employee') {
      goals = goals.filter((g: any) => g.userId === user.id);
    }
    
    const usersDb = getUsersDb();
    const users = await usersDb.users.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    
    const goalsWithInfo = goals.map((goal: any) => {
      const goalUser = users.find((u: any) => u.id === goal.userId);
      const annualGoal = annualGoals.find((ag: any) => ag.id === goal.annualGoalId);
      return {
        ...goal,
        userName: goalUser?.name || 'Unknown',
        annualGoalTitle: annualGoal?.title || 'Unknown',
      };
    });
    
    return jsonResponse(goalsWithInfo);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get MBO goals error:', error);
    return errorResponse('Failed to get MBO goals', 500);
  }
}

// Create MBO goal
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    const db = getDb();
    
    const { title, description, annualGoalId, userId, targetValue, currentValue } = body;

    if (!title || !annualGoalId) {
      return errorResponse('Title and annualGoalId are required', 400);
    }

    const assignedUserId = userId || user.id;
    const goal = await db.mboGoals.create({
      organizationId: user.organizationId,
      title,
      description: description || '',
      annualGoalId,
      userId: assignedUserId,
      targetValue: targetValue || '',
      currentValue: currentValue || '',
      createdBy: user.id,
    });

    try {
      const usersDb = getUsersDb();
      const users = await usersDb.users.getByOrganization(user.organizationId);
      const managerIds = users.filter((u: any) => u.role === 'manager' || u.role === 'owner').map((u: any) => u.id);
      const toNotify = [...new Set([assignedUserId, ...managerIds])].filter((id) => id !== user.id);
      if (toNotify.length > 0) {
        createNotificationForUsers(toNotify, {
          organizationId: user.organizationId,
          type: 'goal_created',
          title: 'New MBO goal',
          message: `MBO goal "${title}" was created`,
          link: '/goals',
        });
      }
    } catch (_) {}

    return jsonResponse(goal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create MBO goal error:', error);
    return errorResponse('Failed to create MBO goal', 500);
  }
}

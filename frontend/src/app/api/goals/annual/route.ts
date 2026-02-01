import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { createNotificationForUsers } from '@/lib/notifications-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get all annual goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    
    let goals = await db.annualGoals.getByOrganization(user.organizationId);
    
    if (user.role === 'employee') {
      goals = goals.filter((g: any) => g.userId === user.id);
    }
    
    const usersDb = getUsersDb();
    const users = await usersDb.users.getByOrganization(user.organizationId);
    
    const goalsWithUser = goals.map((goal: any) => {
      const goalUser = users.find((u: any) => u.id === goal.userId);
      return { ...goal, userName: goalUser?.name || 'Unknown' };
    });
    
    return jsonResponse(goalsWithUser);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get annual goals error:', error);
    return errorResponse('Failed to get annual goals', 500);
  }
}

// Create annual goal (Owner/Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    const db = getDb();
    
    const { title, description, year } = body;

    if (!title || !year) {
      return errorResponse('Title and year are required', 400);
    }

    const goal = await db.annualGoals.create({
      organizationId: user.organizationId,
      title,
      description: description || '',
      year,
      userId: user.id,
      createdBy: user.id,
    });

    try {
      const usersDb = getUsersDb();
      const users = await usersDb.users.getByOrganization(user.organizationId);
      const managerIds = users.filter((u: any) => u.role === 'manager' || u.role === 'owner').map((u: any) => u.id);
      if (managerIds.length > 0) {
        createNotificationForUsers(managerIds, {
          organizationId: user.organizationId,
          type: 'goal_created',
          title: 'New annual goal',
          message: `Annual goal "${title}" was created`,
          link: '/goals',
        });
      }
    } catch (_) {}

    return jsonResponse(goal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create annual goal error:', error);
    return errorResponse('Failed to create annual goal', 500);
  }
}

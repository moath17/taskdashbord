import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get all vacation plans
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    const usersDb = getUsersDb();
    
    let plans = await db.vacationPlans.getByOrganization(user.organizationId);

    if (user.role === 'employee') {
      plans = plans.filter((p: any) => p.userId === user.id);
    }

    const users = await usersDb.users.getByOrganization(user.organizationId);
    
    const plansWithUsers = plans.map((plan: any) => {
      const planUser = users.find((u: any) => u.id === plan.userId);
      return {
        ...plan,
        user: planUser ? { id: planUser.id, name: planUser.name, email: planUser.email } : null,
      };
    });

    return jsonResponse(plansWithUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get vacation plans error:', error);
    return errorResponse('Failed to get vacation plans', 500);
  }
}

// Create vacation plan
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const db = getDb();
    
    const { type, startDate, endDate, notes } = body;

    if (!type || !startDate || !endDate) {
      return errorResponse('Missing required fields', 400);
    }

    const plan = await db.vacationPlans.create({
      organizationId: user.organizationId,
      userId: user.id,
      type,
      startDate,
      endDate,
      notes: notes || '',
      status: 'pending',
    });

    return jsonResponse(plan, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Create vacation plan error:', error);
    return errorResponse('Failed to create vacation plan', 500);
  }
}

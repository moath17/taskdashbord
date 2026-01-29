import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all training plans
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    let plans = await db.trainingPlans.getByOrganization(user.organizationId);

    if (user.role === 'employee') {
      plans = plans.filter((p: any) => p.userId === user.id);
    }

    const users = await db.users.getByOrganization(user.organizationId);
    
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
    console.error('Get training plans error:', error);
    return errorResponse('Failed to get training plans', 500);
  }
}

// Create training plan
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    
    const { courseName, platform, duration, startDate, endDate, notes } = body;

    if (!courseName || !platform) {
      return errorResponse('Missing required fields', 400);
    }

    const plan = await db.trainingPlans.create({
      organizationId: user.organizationId,
      userId: user.id,
      courseName,
      platform,
      duration: duration || '',
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes || '',
      status: 'pending',
    });

    return jsonResponse(plan, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Create training plan error:', error);
    return errorResponse('Failed to create training plan', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { TrainingPlan } from '@/lib/types';

// Get all training plans
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    await db.read();
    let plans = [...db.data.trainingPlans];

    if (user.role === 'employee') {
      plans = plans.filter((p) => p.userId === user.id);
    }

    const plansWithUsers = plans.map((plan) => {
      const planUser = db.data.users.find((u) => u.id === plan.userId);
      return {
        ...plan,
        user: planUser ? { id: planUser.id, name: planUser.name, email: planUser.email } : null,
      };
    });

    return jsonResponse(plansWithUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
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

    await db.read();

    const plan: TrainingPlan = {
      id: generateId(),
      userId: user.id,
      courseName,
      platform,
      duration: duration || '',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.trainingPlans.push(plan);
    await db.write();

    return jsonResponse(plan, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to create training plan', 500);
  }
}

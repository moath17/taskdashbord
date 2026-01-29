import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { AnnualGoal } from '@/lib/types';

// Get all annual goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    await db.read();
    let goals = db.data.annualGoals;
    
    if (user.role === 'employee') {
      goals = goals.filter(g => g.userId === user.id);
    }
    
    const goalsWithUser = goals.map(goal => {
      const goalUser = db.data.users.find(u => u.id === goal.userId);
      return { ...goal, userName: goalUser?.name || 'Unknown' };
    });
    
    return jsonResponse(goalsWithUser);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get annual goals', 500);
  }
}

// Create annual goal (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, description, year } = body;

    if (!title || !year) {
      return errorResponse('Missing required fields', 400);
    }

    await db.read();

    const goal: AnnualGoal = {
      id: generateId(),
      title,
      description: description || '',
      year,
      userId: user.id,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.annualGoals.push(goal);
    await db.write();

    return jsonResponse(goal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create annual goal', 500);
  }
}

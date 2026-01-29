import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { MBOGoal } from '@/lib/types';

// Get all MBO goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    await db.read();
    let goals = db.data.mboGoals;
    
    if (user.role === 'employee') {
      goals = goals.filter(g => g.userId === user.id);
    }
    
    const goalsWithInfo = goals.map(goal => {
      const goalUser = db.data.users.find(u => u.id === goal.userId);
      const annualGoal = db.data.annualGoals.find(ag => ag.id === goal.annualGoalId);
      return {
        ...goal,
        userName: goalUser?.name || 'Unknown',
        annualGoalTitle: annualGoal?.title || 'Unknown',
      };
    });
    
    return jsonResponse(goalsWithInfo);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get MBO goals', 500);
  }
}

// Create MBO goal (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, description, annualGoalId, userId, targetValue, currentValue } = body;

    if (!title || !annualGoalId) {
      return errorResponse('Missing required fields', 400);
    }

    await db.read();

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find(g => g.id === annualGoalId);
    if (!annualGoal) {
      return errorResponse('Annual goal not found', 400);
    }

    // Verify user exists if provided
    if (userId) {
      const targetUser = db.data.users.find(u => u.id === userId);
      if (!targetUser) {
        return errorResponse('User not found', 400);
      }
    }

    const goal: MBOGoal = {
      id: generateId(),
      title,
      description: description || '',
      annualGoalId,
      userId: userId || annualGoal.userId,
      targetValue: targetValue || '',
      currentValue: currentValue || '',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.mboGoals.push(goal);
    await db.write();

    const goalUser = db.data.users.find(u => u.id === goal.userId);
    return jsonResponse({ ...goal, userName: goalUser?.name || 'Unknown' }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create MBO goal', 500);
  }
}

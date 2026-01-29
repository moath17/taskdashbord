import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all MBO goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    let goals = await db.mboGoals.getByOrganization(user.organizationId);
    
    if (user.role === 'employee') {
      goals = goals.filter((g: any) => g.userId === user.id);
    }
    
    const users = await db.users.getByOrganization(user.organizationId);
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
    
    const { title, description, annualGoalId, userId, targetValue, currentValue } = body;

    if (!title || !annualGoalId) {
      return errorResponse('Title and annualGoalId are required', 400);
    }

    const goal = await db.mboGoals.create({
      organizationId: user.organizationId,
      title,
      description: description || '',
      annualGoalId,
      userId: userId || user.id,
      targetValue: targetValue || '',
      currentValue: currentValue || '',
      createdBy: user.id,
    });

    return jsonResponse(goal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create MBO goal error:', error);
    return errorResponse('Failed to create MBO goal', 500);
  }
}

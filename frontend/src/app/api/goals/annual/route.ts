import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all annual goals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    let goals = await db.annualGoals.getByOrganization(user.organizationId);
    
    if (user.role === 'employee') {
      goals = goals.filter((g: any) => g.userId === user.id);
    }
    
    const users = await db.users.getByOrganization(user.organizationId);
    
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

    return jsonResponse(goal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create annual goal error:', error);
    return errorResponse('Failed to create annual goal', 500);
  }
}

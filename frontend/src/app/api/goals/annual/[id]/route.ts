import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update annual goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const goal = await db.annualGoals.getById(id);
    
    if (!goal || goal.organizationId !== user.organizationId) {
      return errorResponse('Annual goal not found', 404);
    }

    const updatedGoal = await db.annualGoals.update(id, body);
    return jsonResponse(updatedGoal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update annual goal error:', error);
    return errorResponse('Failed to update annual goal', 500);
  }
}

// Delete annual goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const goal = await db.annualGoals.getById(id);
    
    if (!goal || goal.organizationId !== user.organizationId) {
      return errorResponse('Annual goal not found', 404);
    }

    // Check for linked MBO goals
    const mboGoals = await db.mboGoals.getByAnnualGoal(id);
    if (mboGoals.length > 0) {
      return errorResponse('Cannot delete: This annual goal has linked MBO goals', 400);
    }

    await db.annualGoals.delete(id);
    return jsonResponse({ message: 'Annual goal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete annual goal error:', error);
    return errorResponse('Failed to delete annual goal', 500);
  }
}

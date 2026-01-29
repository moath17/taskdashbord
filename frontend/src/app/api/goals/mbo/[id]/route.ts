import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update MBO goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const goal = await db.mboGoals.getById(id);
    
    if (!goal || goal.organizationId !== user.organizationId) {
      return errorResponse('MBO goal not found', 404);
    }

    const updatedGoal = await db.mboGoals.update(id, body);
    return jsonResponse(updatedGoal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update MBO goal error:', error);
    return errorResponse('Failed to update MBO goal', 500);
  }
}

// Delete MBO goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const goal = await db.mboGoals.getById(id);
    
    if (!goal || goal.organizationId !== user.organizationId) {
      return errorResponse('MBO goal not found', 404);
    }

    await db.mboGoals.delete(id);
    return jsonResponse({ message: 'MBO goal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete MBO goal error:', error);
    return errorResponse('Failed to delete MBO goal', 500);
  }
}

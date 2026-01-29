import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update MBO goal (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const goal = db.data.mboGoals.find(g => g.id === id);
    
    if (!goal) {
      return errorResponse('MBO goal not found', 404);
    }

    const { title, description, targetValue, currentValue } = body;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) goal.currentValue = currentValue;
    goal.updatedAt = new Date().toISOString();

    await db.write();
    return jsonResponse(goal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update MBO goal', 500);
  }
}

// Delete MBO goal (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.mboGoals.findIndex(g => g.id === id);
    
    if (index === -1) {
      return errorResponse('MBO goal not found', 404);
    }

    // Check for linked tasks
    const linkedTasks = db.data.tasks.filter(t => t.mboGoalId === id);
    if (linkedTasks.length > 0) {
      return errorResponse('Cannot delete: This MBO goal has linked tasks. Delete or reassign them first.', 400);
    }

    db.data.mboGoals.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'MBO goal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete MBO goal', 500);
  }
}

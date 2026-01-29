import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update annual goal (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const goal = db.data.annualGoals.find(g => g.id === id);
    
    if (!goal) {
      return errorResponse('Annual goal not found', 404);
    }

    const { title, description, year } = body;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (year) goal.year = year;
    goal.updatedAt = new Date().toISOString();

    await db.write();
    return jsonResponse(goal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update annual goal', 500);
  }
}

// Delete annual goal (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.annualGoals.findIndex(g => g.id === id);
    
    if (index === -1) {
      return errorResponse('Annual goal not found', 404);
    }

    // Check for linked MBO goals
    const linkedMBOGoals = db.data.mboGoals.filter(m => m.annualGoalId === id);
    if (linkedMBOGoals.length > 0) {
      return errorResponse('Cannot delete: This annual goal has linked MBO goals. Delete them first.', 400);
    }

    db.data.annualGoals.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'Annual goal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete annual goal', 500);
  }
}

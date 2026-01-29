import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single weekly update (Manager only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const update = db.data.weeklyUpdates.find((u) => u.id === id);
    
    if (!update) {
      return errorResponse('Weekly update not found', 404);
    }

    const user = db.data.users.find((u) => u.id === update.createdBy);
    return jsonResponse({ ...update, createdByName: user?.name || 'Unknown' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to get weekly update', 500);
  }
}

// Update weekly update (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const update = db.data.weeklyUpdates.find((u) => u.id === id);
    
    if (!update) {
      return errorResponse('Weekly update not found', 404);
    }

    const { weekStartDate, weekEndDate, importantTasks, summary } = body;

    if (weekStartDate && weekEndDate) {
      const start = new Date(weekStartDate);
      const end = new Date(weekEndDate);
      if (end < start) {
        return errorResponse('Week end date cannot be before week start date', 400);
      }
    }

    if (weekStartDate) update.weekStartDate = weekStartDate;
    if (weekEndDate) update.weekEndDate = weekEndDate;
    if (importantTasks) update.importantTasks = importantTasks;
    if (summary) update.summary = summary;
    update.updatedAt = new Date().toISOString();

    await db.write();
    return jsonResponse(update);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update weekly update', 500);
  }
}

// Delete weekly update (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.weeklyUpdates.findIndex((u) => u.id === id);
    
    if (index === -1) {
      return errorResponse('Weekly update not found', 404);
    }

    db.data.weeklyUpdates.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'Weekly update deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete weekly update', 500);
  }
}

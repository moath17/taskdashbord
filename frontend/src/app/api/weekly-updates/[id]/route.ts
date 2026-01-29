import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single weekly update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const update = await db.weeklyUpdates.getById(id);
    
    if (!update || update.organizationId !== user.organizationId) {
      return errorResponse('Weekly update not found', 404);
    }

    return jsonResponse(update);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Get weekly update error:', error);
    return errorResponse('Failed to get weekly update', 500);
  }
}

// Update weekly update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const update = await db.weeklyUpdates.getById(id);
    
    if (!update || update.organizationId !== user.organizationId) {
      return errorResponse('Weekly update not found', 404);
    }

    const updatedUpdate = await db.weeklyUpdates.update(id, body);
    return jsonResponse(updatedUpdate);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update weekly update error:', error);
    return errorResponse('Failed to update weekly update', 500);
  }
}

// Delete weekly update
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const update = await db.weeklyUpdates.getById(id);
    
    if (!update || update.organizationId !== user.organizationId) {
      return errorResponse('Weekly update not found', 404);
    }

    await db.weeklyUpdates.delete(id);
    return jsonResponse({ message: 'Weekly update deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete weekly update error:', error);
    return errorResponse('Failed to delete weekly update', 500);
  }
}

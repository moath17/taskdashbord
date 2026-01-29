import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Add comment to task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    
    if (!body.content?.trim()) {
      return errorResponse('Content is required', 400);
    }

    const task = await db.tasks.getById(id);
    
    if (!task || task.organizationId !== user.organizationId) {
      return errorResponse('Task not found', 404);
    }

    if (user.role === 'employee' && task.assignedTo !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const comment = await db.comments.create({
      organizationId: user.organizationId,
      taskId: id,
      userId: user.id,
      content: body.content,
    });

    return jsonResponse({
      ...comment,
      user: { id: user.id, name: user.name },
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Add comment error:', error);
    return errorResponse('Failed to add comment', 500);
  }
}

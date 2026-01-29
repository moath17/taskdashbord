import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const task = await db.tasks.getById(id);
    
    if (!task || task.organizationId !== user.organizationId) {
      return errorResponse('Task not found', 404);
    }

    if (user.role === 'employee' && task.assignedTo !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const users = await db.users.getByOrganization(user.organizationId);
    const comments = await db.comments.getByTask(task.id);
    
    const commentsWithUsers = comments.map((comment: any) => {
      const commentUser = users.find((u: any) => u.id === comment.userId);
      return {
        ...comment,
        user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
      };
    });

    const assignedUser = users.find((u: any) => u.id === task.assignedTo);

    return jsonResponse({
      ...task,
      assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email } : null,
      comments: commentsWithUsers,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get task error:', error);
    return errorResponse('Failed to get task', 500);
  }
}

// Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    
    const task = await db.tasks.getById(id);
    
    if (!task || task.organizationId !== user.organizationId) {
      return errorResponse('Task not found', 404);
    }

    if (user.role === 'employee' && task.assignedTo !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const updatedTask = await db.tasks.update(id, body);
    return jsonResponse(updatedTask);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Update task error:', error);
    return errorResponse('Failed to update task', 500);
  }
}

// Delete task (Owner/Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const task = await db.tasks.getById(id);
    
    if (!task || task.organizationId !== user.organizationId) {
      return errorResponse('Task not found', 404);
    }

    await db.comments.deleteByTask(id);
    await db.tasks.delete(id);

    return jsonResponse({ message: 'Task deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete task error:', error);
    return errorResponse('Failed to delete task', 500);
  }
}

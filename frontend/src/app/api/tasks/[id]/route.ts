import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    await db.read();
    const task = db.data.tasks.find((t) => t.id === id);
    
    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (user.role === 'employee' && task.assignedTo !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const assignedUser = db.data.users.find((u) => u.id === task.assignedTo);
    const comments = db.data.comments.filter((c) => c.taskId === task.id);
    const commentsWithUsers = comments.map((comment) => {
      const commentUser = db.data.users.find((u) => u.id === comment.userId);
      return {
        ...comment,
        user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
      };
    });

    return jsonResponse({
      ...task,
      assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email } : null,
      comments: commentsWithUsers,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
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
    
    await db.read();
    const taskIndex = db.data.tasks.findIndex((t) => t.id === id);
    
    if (taskIndex === -1) {
      return errorResponse('Task not found', 404);
    }

    const task = db.data.tasks[taskIndex];

    if (user.role === 'employee' && task.assignedTo !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const { title, description, assignedTo, startDate, dueDate, status, priority } = body;
    
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) {
      const assignedUser = db.data.users.find((u) => u.id === assignedTo);
      if (!assignedUser) {
        return errorResponse('Assigned user not found', 400);
      }
      task.assignedTo = assignedTo;
    }
    if (startDate) task.startDate = startDate;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    task.updatedAt = new Date().toISOString();

    db.data.tasks[taskIndex] = task;
    await db.write();

    return jsonResponse(task);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to update task', 500);
  }
}

// Delete task (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const taskIndex = db.data.tasks.findIndex((t) => t.id === id);
    
    if (taskIndex === -1) {
      return errorResponse('Task not found', 404);
    }

    // Delete related comments
    db.data.comments = db.data.comments.filter((c) => c.taskId !== id);
    db.data.tasks.splice(taskIndex, 1);
    await db.write();

    return jsonResponse({ message: 'Task deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete task', 500);
  }
}

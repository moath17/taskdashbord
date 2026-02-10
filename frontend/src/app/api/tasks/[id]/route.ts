import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';
import { createNotification, notifyManagers } from '@/lib/notifications';

// GET - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        creator:users!tasks_created_by_fkey(id, name),
        goal:goals!tasks_goal_id_fkey(id, title)
      `)
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (error || !task) {
      return errorResponse('Task not found', 404);
    }

    return jsonResponse({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        assignedUser: task.assigned_user,
        createdBy: task.created_by,
        creator: task.creator,
        dueDate: task.due_date,
        goalId: task.goal_id ?? null,
        goal: task.goal ? { id: task.goal.id, title: task.goal.title } : null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Check task exists and belongs to organization
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Task not found', 404);
    }

    const { title, description, status, priority, assignedTo, dueDate, goalId } = body;

    // If goalId provided, verify it exists and belongs to organization
    if (goalId !== undefined) {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('organization_id', user.organizationId)
        .single();

      if (goalError || !goal) {
        return errorResponse('Goal not found or access denied', 400);
      }
    }

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo || null;
    if (dueDate !== undefined) updateData.due_date = dueDate || null;
    if (goalId !== undefined) updateData.goal_id = goalId || null;

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        creator:users!tasks_created_by_fkey(id, name),
        goal:goals!tasks_goal_id_fkey(id, title)
      `)
      .single();

    if (error) {
      console.error('Update task error:', error);
      return errorResponse('Failed to update task', 500);
    }

    // Notify on status change to "done"
    if (status === 'done') {
      notifyManagers({
        organizationId: user.organizationId,
        title: `مهمة مكتملة: ${task.title}`,
        message: `أكمل ${user.name} المهمة`,
        type: 'task',
        excludeUserId: user.id,
      });
    }

    // Notify assigned user if reassigned
    if (assignedTo && assignedTo !== user.id && task.assigned_to !== user.id) {
      createNotification({
        userId: assignedTo,
        organizationId: user.organizationId,
        title: `تم تعيين مهمة لك: ${task.title}`,
        message: `تم تعيينك لمهمة بواسطة ${user.name}`,
        type: 'task',
      });
    }

    return jsonResponse({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        assignedUser: task.assigned_user ? {
          id: task.assigned_user.id,
          name: task.assigned_user.name,
          email: task.assigned_user.email,
        } : null,
        createdBy: task.created_by,
        creator: task.creator ? {
          id: task.creator.id,
          name: task.creator.name,
        } : null,
        dueDate: task.due_date,
        goalId: task.goal_id ?? null,
        goal: task.goal ? { id: task.goal.id, title: task.goal.title } : null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Update task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Check task exists and belongs to organization
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Task not found', 404);
    }

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete task error:', error);
      return errorResponse('Failed to delete task', 500);
    }

    return jsonResponse({ message: 'Task deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Delete task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

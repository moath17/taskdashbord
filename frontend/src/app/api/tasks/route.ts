import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

// GET - Get all tasks for the organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        creator:users!tasks_created_by_fkey(id, name)
      `)
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get tasks error:', error);
      return errorResponse('Failed to get tasks', 500);
    }

    // Transform to camelCase
    const transformedTasks = tasks?.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assigned_to,
      assignedUser: t.assigned_user ? {
        id: t.assigned_user.id,
        name: t.assigned_user.name,
        email: t.assigned_user.email,
      } : null,
      createdBy: t.created_by,
      creator: t.creator ? {
        id: t.creator.id,
        name: t.creator.name,
      } : null,
      dueDate: t.due_date,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })) || [];

    return jsonResponse({ tasks: transformedTasks });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { title, description, status, priority, assignedTo, dueDate } = body;

    // Validation
    if (!title?.trim()) {
      return errorResponse('Title is required', 400);
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: user.organizationId,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'todo',
        priority: priority || 'medium',
        assigned_to: assignedTo || null,
        created_by: user.id,
        due_date: dueDate || null,
      })
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        creator:users!tasks_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create task error:', error);
      return errorResponse('Failed to create task', 500);
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
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Create task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

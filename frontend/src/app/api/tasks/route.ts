import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all tasks for the organization
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    let tasks = await db.tasks.getByOrganization(user.organizationId);

    // Apply role-based filtering for employees
    if (user.role === 'employee') {
      tasks = tasks.filter((t: any) => t.assignedTo === user.id);
    }

    // Apply filters
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    if (assignedTo) tasks = tasks.filter((t: any) => t.assignedTo === assignedTo);
    if (status) tasks = tasks.filter((t: any) => t.status === status);
    if (priority) tasks = tasks.filter((t: any) => t.priority === priority);
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter((t: any) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Get users for assigned info
    const users = await db.users.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    const mboGoals = await db.mboGoals.getByOrganization(user.organizationId);

    const tasksWithInfo = tasks.map((task: any) => {
      const assignedUser = users.find((u: any) => u.id === task.assignedTo);
      const annualGoal = annualGoals.find((g: any) => g.id === task.annualGoalId);
      const mboGoal = mboGoals.find((g: any) => g.id === task.mboGoalId);
      return {
        ...task,
        assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email } : null,
        annualGoal: annualGoal ? { id: annualGoal.id, title: annualGoal.title } : null,
        mboGoal: mboGoal ? { id: mboGoal.id, title: mboGoal.title } : null,
      };
    });

    return jsonResponse(tasksWithInfo);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get tasks error:', error);
    return errorResponse('Failed to get tasks', 500);
  }
}

// Create task (Owner/Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { title, description, assignedTo, annualGoalId, mboGoalId, startDate, dueDate, priority } = body;

    if (!title) {
      return errorResponse('Title is required', 400);
    }

    const task = await db.tasks.create({
      organizationId: user.organizationId,
      title,
      description: description || '',
      assignedTo,
      annualGoalId,
      mboGoalId,
      startDate,
      dueDate,
      status: 'New',
      priority: priority || 'Medium',
      createdBy: user.id,
    });

    return jsonResponse(task, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create task error:', error);
    return errorResponse('Failed to create task', 500);
  }
}

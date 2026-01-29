import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { Task } from '@/lib/types';

// Get all tasks (with filters)
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    await db.read();
    let tasks = [...db.data.tasks];

    // Apply role-based filtering
    if (user.role === 'employee') {
      tasks = tasks.filter((t) => t.assignedTo === user.id);
    }

    // Apply filters
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const annualGoalId = searchParams.get('annualGoalId');
    const mboGoalId = searchParams.get('mboGoalId');

    if (assignedTo) tasks = tasks.filter((t) => t.assignedTo === assignedTo);
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (annualGoalId) tasks = tasks.filter((t) => t.annualGoalId === annualGoalId);
    if (mboGoalId) tasks = tasks.filter((t) => t.mboGoalId === mboGoalId);
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }

    // Populate user and goal info
    const tasksWithInfo = tasks.map((task) => {
      const assignedUser = db.data.users.find((u) => u.id === task.assignedTo);
      const annualGoal = db.data.annualGoals.find((g) => g.id === task.annualGoalId);
      const mboGoal = db.data.mboGoals.find((g) => g.id === task.mboGoalId);
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
    return errorResponse('Failed to get tasks', 500);
  }
}

// Create task (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, description, assignedTo, annualGoalId, mboGoalId, startDate, dueDate, priority } = body;

    if (!title || !description || !assignedTo || !annualGoalId || !mboGoalId || !startDate || !dueDate || !priority) {
      return errorResponse('Missing required fields', 400);
    }

    await db.read();

    // Verify assigned user exists
    const assignedUser = db.data.users.find((u) => u.id === assignedTo);
    if (!assignedUser) {
      return errorResponse('Assigned user not found', 400);
    }

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find((g) => g.id === annualGoalId);
    if (!annualGoal) {
      return errorResponse('Annual Goal not found', 400);
    }

    // Verify MBO goal exists
    const mboGoal = db.data.mboGoals.find((g) => g.id === mboGoalId);
    if (!mboGoal) {
      return errorResponse('MBO Goal not found', 400);
    }

    const task: Task = {
      id: generateId(),
      title,
      description,
      assignedTo,
      annualGoalId,
      mboGoalId,
      startDate,
      dueDate,
      status: 'New',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };

    db.data.tasks.push(task);
    await db.write();

    return jsonResponse(task, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create task', 500);
  }
}

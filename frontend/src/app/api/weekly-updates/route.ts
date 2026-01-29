import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { WeeklyUpdate } from '@/lib/types';

// Get all weekly updates (Manager only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, 'manager');
    
    await db.read();
    const updates = db.data.weeklyUpdates
      .map((update) => {
        const user = db.data.users.find((u) => u.id === update.createdBy);
        return { ...update, createdByName: user?.name || 'Unknown' };
      })
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
    
    return jsonResponse(updates);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to get weekly updates', 500);
  }
}

// Create weekly update (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { weekStartDate, weekEndDate, importantTasks, summary } = body;

    if (!weekStartDate || !weekEndDate || !summary) {
      return errorResponse('Missing required fields', 400);
    }

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    if (end < start) {
      return errorResponse('Week end date cannot be before week start date', 400);
    }

    await db.read();

    const update: WeeklyUpdate = {
      id: generateId(),
      weekStartDate,
      weekEndDate,
      importantTasks: importantTasks || [],
      summary,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.weeklyUpdates.push(update);
    await db.write();

    return jsonResponse(update, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create weekly update', 500);
  }
}

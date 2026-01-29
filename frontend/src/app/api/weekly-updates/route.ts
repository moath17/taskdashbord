import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all weekly updates
export async function GET(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    
    const updates = await db.weeklyUpdates.getByOrganization(user.organizationId);
    const users = await db.users.getByOrganization(user.organizationId);
    
    const updatesWithUsers = updates.map((update: any) => {
      const updateUser = users.find((u: any) => u.id === update.createdBy);
      return { ...update, createdByName: updateUser?.name || 'Unknown' };
    });
    
    return jsonResponse(updatesWithUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Get weekly updates error:', error);
    return errorResponse('Failed to get weekly updates', 500);
  }
}

// Create weekly update
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { weekStartDate, weekEndDate, importantTasks, summary } = body;

    if (!weekStartDate || !weekEndDate || !summary) {
      return errorResponse('Missing required fields', 400);
    }

    const update = await db.weeklyUpdates.create({
      organizationId: user.organizationId,
      weekStartDate,
      weekEndDate,
      importantTasks: importantTasks || [],
      summary,
      createdBy: user.id,
    });

    return jsonResponse(update, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create weekly update error:', error);
    return errorResponse('Failed to create weekly update', 500);
  }
}

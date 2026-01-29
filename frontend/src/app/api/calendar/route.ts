import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all calendar events
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    const events = await db.calendarEvents.getByOrganization(user.organizationId);
    const users = await db.users.getByOrganization(user.organizationId);
    
    const eventsWithUsers = events.map((event: any) => {
      const eventUser = users.find((u: any) => u.id === event.createdBy);
      return { ...event, createdByName: eventUser?.name || 'Unknown' };
    });
    
    return jsonResponse(eventsWithUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get calendar events error:', error);
    return errorResponse('Failed to get calendar events', 500);
  }
}

// Create calendar event
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { title, type, startDate, endDate, description } = body;

    if (!title || !type || !startDate || !endDate) {
      return errorResponse('Missing required fields', 400);
    }

    const event = await db.calendarEvents.create({
      organizationId: user.organizationId,
      title,
      type,
      startDate,
      endDate,
      description: description || '',
      createdBy: user.id,
    });

    return jsonResponse(event, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create calendar event error:', error);
    return errorResponse('Failed to create calendar event', 500);
  }
}

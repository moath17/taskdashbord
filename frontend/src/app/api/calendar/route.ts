import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types';

// Get all calendar events
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    await db.read();
    const events = db.data.calendarEvents.map((event) => {
      const user = db.data.users.find((u) => u.id === event.createdBy);
      return { ...event, createdByName: user?.name || 'Unknown' };
    });
    
    return jsonResponse(events);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get calendar events', 500);
  }
}

// Create calendar event (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, type, startDate, endDate, description } = body;

    if (!title || !type || !startDate || !endDate) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['holiday', 'training'].includes(type)) {
      return errorResponse('Invalid type', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return errorResponse('End date cannot be before start date', 400);
    }

    await db.read();

    const event: CalendarEvent = {
      id: generateId(),
      title,
      type,
      startDate,
      endDate,
      description: description || '',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.calendarEvents.push(event);
    await db.write();

    return jsonResponse(event, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create calendar event', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    
    await db.read();
    const event = db.data.calendarEvents.find((e) => e.id === id);
    
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const user = db.data.users.find((u) => u.id === event.createdBy);
    return jsonResponse({ ...event, createdByName: user?.name || 'Unknown' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get event', 500);
  }
}

// Update calendar event (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const event = db.data.calendarEvents.find((e) => e.id === id);
    
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const { title, type, startDate, endDate, description } = body;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return errorResponse('End date cannot be before start date', 400);
      }
    }

    if (title) event.title = title;
    if (type) event.type = type;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (description !== undefined) event.description = description;
    event.updatedAt = new Date().toISOString();

    await db.write();
    return jsonResponse(event);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update event', 500);
  }
}

// Delete calendar event (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.calendarEvents.findIndex((e) => e.id === id);
    
    if (index === -1) {
      return errorResponse('Event not found', 404);
    }

    db.data.calendarEvents.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'Event deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete event', 500);
  }
}

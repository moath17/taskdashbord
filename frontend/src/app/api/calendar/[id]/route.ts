import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const event = await db.calendarEvents.getById(id);
    
    if (!event || event.organizationId !== user.organizationId) {
      return errorResponse('Event not found', 404);
    }

    return jsonResponse(event);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get event error:', error);
    return errorResponse('Failed to get event', 500);
  }
}

// Update calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const event = await db.calendarEvents.getById(id);
    
    if (!event || event.organizationId !== user.organizationId) {
      return errorResponse('Event not found', 404);
    }

    const updatedEvent = await db.calendarEvents.update(id, body);
    return jsonResponse(updatedEvent);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update event error:', error);
    return errorResponse('Failed to update event', 500);
  }
}

// Delete calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const event = await db.calendarEvents.getById(id);
    
    if (!event || event.organizationId !== user.organizationId) {
      return errorResponse('Event not found', 404);
    }

    await db.calendarEvents.delete(id);
    return jsonResponse({ message: 'Event deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete event error:', error);
    return errorResponse('Failed to delete event', 500);
  }
}

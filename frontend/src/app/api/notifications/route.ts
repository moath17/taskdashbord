import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getNotificationsByUser,
  markAllAsRead,
  getUnreadCount,
} from '@/lib/notifications-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      const count = getUnreadCount(user.id, user.organizationId);
      return jsonResponse({ count });
    }

    const notifications = getNotificationsByUser(user.id, user.organizationId, limit);
    return jsonResponse(notifications);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get notifications error:', error);
    return errorResponse('Failed to get notifications', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();

    if (body.markAllRead) {
      const count = markAllAsRead(user.id, user.organizationId);
      return jsonResponse({ marked: count });
    }

    return errorResponse('Invalid request', 400);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Mark read error:', error);
    return errorResponse('Failed to update notifications', 500);
  }
}

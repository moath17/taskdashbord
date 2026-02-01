import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { markAsRead } from '@/lib/notifications-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;

    const updated = markAsRead(id, user.id);
    if (!updated) {
      return errorResponse('Notification not found', 404);
    }

    return jsonResponse({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Mark notification read error:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

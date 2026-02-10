import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get notifications error:', error);
      return errorResponse('Failed to get notifications', 500);
    }

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    return jsonResponse({
      notifications: notifications?.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        createdAt: n.created_at,
      })) || [],
      unreadCount,
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get notifications error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all read error:', error);
      return errorResponse('Failed to mark notifications as read', 500);
    }

    return jsonResponse({ message: 'All notifications marked as read' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}

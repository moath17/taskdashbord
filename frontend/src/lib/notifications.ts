import { supabase } from './supabase';

/**
 * Create a notification for a user.
 * This is a fire-and-forget helper — errors are logged but don't break the caller.
 */
export async function createNotification(params: {
  userId: string;
  organizationId: string;
  title: string;
  message?: string;
  type: 'task' | 'goal' | 'leave' | 'training' | 'kpi' | 'team' | 'password' | 'system';
}) {
  try {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      organization_id: params.organizationId,
      title: params.title,
      message: params.message || null,
      type: params.type,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

/**
 * Send a notification to all owners and managers in an organization.
 */
export async function notifyManagers(params: {
  organizationId: string;
  title: string;
  message?: string;
  type: 'task' | 'goal' | 'leave' | 'training' | 'kpi' | 'team' | 'password' | 'system';
  excludeUserId?: string;
}) {
  try {
    const { data: managers } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', params.organizationId)
      .in('role', ['owner', 'manager']);

    if (!managers || managers.length === 0) return;

    const notifications = managers
      .filter(m => m.id !== params.excludeUserId)
      .map(m => ({
        user_id: m.id,
        organization_id: params.organizationId,
        title: params.title,
        message: params.message || null,
        type: params.type,
      }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('Failed to notify managers:', err);
  }
}

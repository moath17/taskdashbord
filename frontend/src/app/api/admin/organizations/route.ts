import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Helper to check if admin token is valid
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('admin:');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifyAdminToken(request)) {
      return errorResponse('Unauthorized', 401);
    }

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgError) {
      console.error('Get organizations error:', orgError);
      return errorResponse('Failed to get organizations', 500);
    }

    // Get user counts and activity for each organization
    const orgsWithStats = await Promise.all(
      (organizations || []).map(async (org) => {
        // Get users for this organization
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, last_activity, created_at')
          .eq('organization_id', org.id);

        if (usersError) {
          console.error('Get users error:', usersError);
        }

        const userList = users || [];
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        // Calculate online users (active in last 5 minutes)
        const onlineUsers = userList.filter((user) => {
          if (!user.last_activity) return false;
          return new Date(user.last_activity) > fiveMinutesAgo;
        });

        // Get most recent activity
        const lastActivity = userList.reduce((latest, user) => {
          if (!user.last_activity) return latest;
          const activityDate = new Date(user.last_activity);
          return activityDate > latest ? activityDate : latest;
        }, new Date(0));

        return {
          id: org.id,
          name: org.name,
          createdAt: org.created_at,
          totalMembers: userList.length,
          onlineCount: onlineUsers.length,
          lastActivity: lastActivity.getTime() > 0 ? lastActivity.toISOString() : null,
          members: userList.map((u) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            isOnline: u.last_activity ? new Date(u.last_activity) > fiveMinutesAgo : false,
            lastActivity: u.last_activity,
          })),
        };
      })
    );

    // Calculate summary stats
    const totalOrganizations = orgsWithStats.length;
    const totalUsers = orgsWithStats.reduce((sum, org) => sum + org.totalMembers, 0);
    const totalOnline = orgsWithStats.reduce((sum, org) => sum + org.onlineCount, 0);

    return jsonResponse({
      summary: {
        totalOrganizations,
        totalUsers,
        totalOnline,
        totalOffline: totalUsers - totalOnline,
      },
      organizations: orgsWithStats,
    });
  } catch (error: any) {
    console.error('Admin organizations error:', error);
    return errorResponse('Failed to fetch organizations', 500);
  }
}

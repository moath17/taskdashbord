import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/auth';

const ADMIN_PASSWORD = '***REMOVED***';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Admin ', '');
  return password === ADMIN_PASSWORD;
}

// GET - Get all organizations with members
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgError) {
      console.error('Get organizations error:', orgError);
      return errorResponse('Failed to get organizations', 500);
    }

    // Get all users with their organization
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, organization_id, last_activity, created_at')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('Get users error:', usersError);
      return errorResponse('Failed to get users', 500);
    }

    // Combine data
    const orgsWithMembers = organizations?.map(org => {
      const members = users?.filter(u => u.organization_id === org.id) || [];
      
      // Check if any member was active in the last 15 minutes
      const now = new Date().getTime();
      const isOnline = members.some(m => {
        if (!m.last_activity) return false;
        const lastActive = new Date(m.last_activity).getTime();
        return (now - lastActive) < 15 * 60 * 1000; // 15 minutes
      });

      return {
        id: org.id,
        name: org.name,
        createdAt: org.created_at,
        isOnline,
        membersCount: members.length,
        members: members.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          lastActivity: m.last_activity,
          isOnline: m.last_activity ? (now - new Date(m.last_activity).getTime()) < 15 * 60 * 1000 : false,
          createdAt: m.created_at,
        })),
      };
    }) || [];

    // Stats
    const totalOrganizations = orgsWithMembers.length;
    const onlineOrganizations = orgsWithMembers.filter(o => o.isOnline).length;
    const totalUsers = users?.length || 0;
    const onlineUsers = users?.filter(u => {
      if (!u.last_activity) return false;
      const now2 = new Date().getTime();
      return (now2 - new Date(u.last_activity).getTime()) < 15 * 60 * 1000;
    }).length || 0;

    return jsonResponse({
      stats: {
        totalOrganizations,
        onlineOrganizations,
        totalUsers,
        onlineUsers,
      },
      organizations: orgsWithMembers,
    });

  } catch (error: any) {
    console.error('Admin get orgs error:', error);
    return errorResponse('Internal server error', 500);
  }
}

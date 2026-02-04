import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    // Get fresh user data with organization
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .eq('id', authUser.id)
      .single();

    if (error || !user) {
      return errorResponse('User not found', 404);
    }

    // Update last activity
    await supabase
      .from('users')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', user.id);

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organizations?.name,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get me error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';
import { notifyManagers } from '@/lib/notifications';

// GET - Get all leaves for the organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let query = supabase
      .from('leaves')
      .select(`
        *,
        user:users!leaves_user_id_fkey(id, name, email, role),
        reviewer:users!leaves_reviewed_by_fkey(id, name)
      `)
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    // Employees only see their own leaves
    if (user.role === 'employee') {
      query = query.eq('user_id', user.id);
    }

    const { data: leaves, error } = await query;

    if (error) {
      console.error('Get leaves error:', error);
      return errorResponse('Failed to get leaves', 500);
    }

    const transformedLeaves = leaves?.map(l => ({
      id: l.id,
      userId: l.user_id,
      user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email, role: l.user.role } : null,
      type: l.type,
      status: l.status,
      startDate: l.start_date,
      endDate: l.end_date,
      reason: l.reason,
      reviewedBy: l.reviewed_by,
      reviewer: l.reviewer ? { id: l.reviewer.id, name: l.reviewer.name } : null,
      reviewedAt: l.reviewed_at,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    })) || [];

    return jsonResponse({ leaves: transformedLeaves });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get leaves error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new leave request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { type, startDate, endDate, reason } = body;

    if (!type || !startDate || !endDate) {
      return errorResponse('Type, start date and end date are required', 400);
    }

    if (new Date(endDate) < new Date(startDate)) {
      return errorResponse('End date must be after start date', 400);
    }

    const { data: leave, error } = await supabase
      .from('leaves')
      .insert({
        organization_id: user.organizationId,
        user_id: user.id,
        type,
        start_date: startDate,
        end_date: endDate,
        reason: reason?.trim() || null,
      })
      .select(`
        *,
        user:users!leaves_user_id_fkey(id, name, email, role),
        reviewer:users!leaves_reviewed_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create leave error:', error);
      return errorResponse('Failed to create leave request', 500);
    }

    // Notify managers about new leave request
    notifyManagers({
      organizationId: user.organizationId,
      title: `طلب إجازة جديد من ${user.name}`,
      message: `نوع الإجازة: ${type} | من ${startDate} إلى ${endDate}`,
      type: 'leave',
      excludeUserId: user.id,
    });

    return jsonResponse({
      leave: {
        id: leave.id,
        userId: leave.user_id,
        user: leave.user ? { id: leave.user.id, name: leave.user.name, email: leave.user.email, role: leave.user.role } : null,
        type: leave.type,
        status: leave.status,
        startDate: leave.start_date,
        endDate: leave.end_date,
        reason: leave.reason,
        reviewedBy: leave.reviewed_by,
        reviewer: null,
        reviewedAt: leave.reviewed_at,
        createdAt: leave.created_at,
        updatedAt: leave.updated_at,
      },
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Create leave error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

// PUT - Update leave (approve/reject or edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Check leave exists and belongs to organization
    const { data: existing } = await supabase
      .from('leaves')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Leave request not found', 404);
    }

    const { status, type, startDate, endDate, reason } = body;

    const updateData: any = { updated_at: new Date().toISOString() };

    // Approve/Reject - only owner/manager
    if (status === 'approved' || status === 'rejected') {
      if (user.role === 'employee') {
        return errorResponse('Not authorized to approve/reject leaves', 403);
      }
      updateData.status = status;
      updateData.reviewed_by = user.id;
      updateData.reviewed_at = new Date().toISOString();
    }

    // Cancel - only the requester or owner/manager
    if (status === 'cancelled') {
      if (existing.user_id !== user.id && user.role === 'employee') {
        return errorResponse('Not authorized to cancel this leave', 403);
      }
      updateData.status = 'cancelled';
    }

    // Edit fields (only if still pending)
    if (existing.status === 'pending') {
      if (type !== undefined) updateData.type = type;
      if (startDate !== undefined) updateData.start_date = startDate;
      if (endDate !== undefined) updateData.end_date = endDate;
      if (reason !== undefined) updateData.reason = reason?.trim() || null;
    }

    const { data: leave, error } = await supabase
      .from('leaves')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users!leaves_user_id_fkey(id, name, email, role),
        reviewer:users!leaves_reviewed_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Update leave error:', error);
      return errorResponse('Failed to update leave', 500);
    }

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
        reviewer: leave.reviewer ? { id: leave.reviewer.id, name: leave.reviewer.name } : null,
        reviewedAt: leave.reviewed_at,
        createdAt: leave.created_at,
        updatedAt: leave.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Update leave error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const { data: existing } = await supabase
      .from('leaves')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Leave request not found', 404);
    }

    // Only own pending leaves or owner/manager can delete
    if (existing.user_id !== user.id && user.role === 'employee') {
      return errorResponse('Not authorized to delete this leave', 403);
    }

    const { error } = await supabase.from('leaves').delete().eq('id', id);

    if (error) {
      console.error('Delete leave error:', error);
      return errorResponse('Failed to delete leave', 500);
    }

    return jsonResponse({ message: 'Leave deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Delete leave error:', error);
    return errorResponse('Internal server error', 500);
  }
}

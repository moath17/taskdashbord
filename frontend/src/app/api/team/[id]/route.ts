import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, hashPassword, jsonResponse, errorResponse } from '@/lib/auth';

// PUT - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Only Owner and Manager can update members
    if (!['owner', 'manager'].includes(user.role)) {
      return errorResponse('Only owners and managers can update team members', 403);
    }

    // Get the member to update
    const { data: member, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (fetchError || !member) {
      return errorResponse('Member not found', 404);
    }

    // Can't update owner
    if (member.role === 'owner') {
      return errorResponse('Cannot update organization owner', 403);
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Build update object
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role && ['manager', 'employee'].includes(role)) {
      updateData.role = role;
    }
    if (password && password.length >= 6) {
      updateData.password = await hashPassword(password);
    }

    updateData.updated_at = new Date().toISOString();

    // Update member
    const { data: updated, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('Update member error:', error);
      return errorResponse('Failed to update member', 500);
    }

    return jsonResponse({
      member: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        createdAt: updated.created_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Update member error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Only Owner and Manager can delete members
    if (!['owner', 'manager'].includes(user.role)) {
      return errorResponse('Only owners and managers can remove team members', 403);
    }

    // Can't delete yourself
    if (id === user.id) {
      return errorResponse('Cannot delete yourself', 400);
    }

    // Get the member to delete
    const { data: member, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (fetchError || !member) {
      return errorResponse('Member not found', 404);
    }

    // Can't delete owner
    if (member.role === 'owner') {
      return errorResponse('Cannot delete organization owner', 403);
    }

    // Delete member
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete member error:', error);
      return errorResponse('Failed to delete member', 500);
    }

    return jsonResponse({ message: 'Member deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Delete member error:', error);
    return errorResponse('Internal server error', 500);
  }
}

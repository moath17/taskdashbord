import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

// GET - Get single goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const { data: goal, error } = await supabase
      .from('goals')
      .select(`
        *,
        owner:users!goals_owner_id_fkey(id, name, email),
        creator:users!goals_created_by_fkey(id, name)
      `)
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (error || !goal) {
      return errorResponse('Goal not found', 404);
    }

    return jsonResponse({
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        status: goal.status,
        progress: goal.progress,
        startDate: goal.start_date,
        endDate: goal.end_date,
        ownerId: goal.owner_id,
        owner: goal.owner,
        createdBy: goal.created_by,
        creator: goal.creator,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get goal error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Update goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Check goal exists and belongs to organization
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Goal not found', 404);
    }

    const { title, description, type, status, progress, startDate, endDate, ownerId } = body;

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, progress));
    if (startDate !== undefined) updateData.start_date = startDate || null;
    if (endDate !== undefined) updateData.end_date = endDate || null;
    if (ownerId !== undefined) updateData.owner_id = ownerId || null;

    // Update goal
    const { data: goal, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        owner:users!goals_owner_id_fkey(id, name, email),
        creator:users!goals_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Update goal error:', error);
      return errorResponse('Failed to update goal', 500);
    }

    return jsonResponse({
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        status: goal.status,
        progress: goal.progress,
        startDate: goal.start_date,
        endDate: goal.end_date,
        ownerId: goal.owner_id,
        owner: goal.owner ? {
          id: goal.owner.id,
          name: goal.owner.name,
          email: goal.owner.email,
        } : null,
        createdBy: goal.created_by,
        creator: goal.creator ? {
          id: goal.creator.id,
          name: goal.creator.name,
        } : null,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Update goal error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Only owner/manager can delete goals
    if (user.role === 'employee') {
      return errorResponse('Not authorized to delete goals', 403);
    }

    // Check goal exists and belongs to organization
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Goal not found', 404);
    }

    // Delete goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete goal error:', error);
      return errorResponse('Failed to delete goal', 500);
    }

    return jsonResponse({ message: 'Goal deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Delete goal error:', error);
    return errorResponse('Internal server error', 500);
  }
}

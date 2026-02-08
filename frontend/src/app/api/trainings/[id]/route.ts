import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

// PUT - Update training
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    if (user.role === 'employee') {
      return errorResponse('Not authorized', 403);
    }

    const { data: existing } = await supabase
      .from('trainings')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Training not found', 404);
    }

    const body = await request.json();
    const { title, description, type, status, startDate, endDate, provider, location, participantIds } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.start_date = startDate || null;
    if (endDate !== undefined) updateData.end_date = endDate || null;
    if (provider !== undefined) updateData.provider = provider?.trim() || null;
    if (location !== undefined) updateData.location = location?.trim() || null;

    const { data: training, error } = await supabase
      .from('trainings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        creator:users!trainings_created_by_fkey(id, name),
        training_participants(
          id,
          status,
          user:users(id, name, email)
        )
      `)
      .single();

    if (error) {
      console.error('Update training error:', error);
      return errorResponse('Failed to update training', 500);
    }

    // Update participants if provided
    if (participantIds !== undefined) {
      // Remove existing
      await supabase.from('training_participants').delete().eq('training_id', id);
      // Add new
      if (participantIds.length > 0) {
        const participants = participantIds.map((userId: string) => ({
          training_id: id,
          user_id: userId,
        }));
        await supabase.from('training_participants').insert(participants);
      }
    }

    return jsonResponse({
      training: {
        id: training.id,
        title: training.title,
        description: training.description,
        type: training.type,
        status: training.status,
        startDate: training.start_date,
        endDate: training.end_date,
        provider: training.provider,
        location: training.location,
        createdBy: training.created_by,
        creator: training.creator ? { id: training.creator.id, name: training.creator.name } : null,
        participants: training.training_participants?.map((p: any) => ({
          id: p.id,
          status: p.status,
          user: p.user ? { id: p.user.id, name: p.user.name, email: p.user.email } : null,
        })) || [],
        createdAt: training.created_at,
        updatedAt: training.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Update training error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete training
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    if (user.role === 'employee') {
      return errorResponse('Not authorized', 403);
    }

    const { data: existing } = await supabase
      .from('trainings')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('Training not found', 404);
    }

    const { error } = await supabase.from('trainings').delete().eq('id', id);

    if (error) {
      console.error('Delete training error:', error);
      return errorResponse('Failed to delete training', 500);
    }

    return jsonResponse({ message: 'Training deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Delete training error:', error);
    return errorResponse('Internal server error', 500);
  }
}

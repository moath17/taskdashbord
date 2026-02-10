import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET - Get all trainings for the organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: trainings, error } = await supabase
      .from('trainings')
      .select(`
        *,
        creator:users!trainings_created_by_fkey(id, name),
        training_participants(
          id,
          status,
          user:users(id, name, email)
        )
      `)
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get trainings error:', error);
      return errorResponse('Failed to get trainings', 500);
    }

    const transformedTrainings = trainings?.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type,
      status: t.status,
      startDate: t.start_date,
      endDate: t.end_date,
      provider: t.provider,
      location: t.location,
      createdBy: t.created_by,
      creator: t.creator ? { id: t.creator.id, name: t.creator.name } : null,
      participants: t.training_participants?.map((p: any) => ({
        id: p.id,
        status: p.status,
        user: p.user ? { id: p.user.id, name: p.user.name, email: p.user.email } : null,
      })) || [],
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })) || [];

    return jsonResponse({ trainings: transformedTrainings });

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get trainings error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new training
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Only owner/manager can create trainings
    if (user.role === 'employee') {
      return errorResponse('Not authorized to create trainings', 403);
    }

    const body = await request.json();
    const { title, description, type, status, startDate, endDate, provider, location, participantIds } = body;

    if (!title?.trim()) {
      return errorResponse('Title is required', 400);
    }

    // Create training
    const { data: training, error } = await supabase
      .from('trainings')
      .insert({
        organization_id: user.organizationId,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || 'course',
        status: status || 'planned',
        start_date: startDate || null,
        end_date: endDate || null,
        provider: provider?.trim() || null,
        location: location?.trim() || null,
        created_by: user.id,
      })
      .select(`
        *,
        creator:users!trainings_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create training error:', error);
      return errorResponse('Failed to create training', 500);
    }

    // Add participants if provided
    if (participantIds && participantIds.length > 0) {
      const participants = participantIds.map((uid: string) => ({
        training_id: training.id,
        user_id: uid,
      }));

      await supabase.from('training_participants').insert(participants);

      // Notify each participant
      for (const uid of participantIds) {
        if (uid !== user.id) {
          createNotification({
            userId: uid,
            organizationId: user.organizationId,
            title: `تدريب جديد: ${training.title}`,
            message: `تمت إضافتك لتدريب بواسطة ${user.name}`,
            type: 'training',
          });
        }
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
        participants: [],
        createdAt: training.created_at,
        updatedAt: training.updated_at,
      },
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Create training error:', error);
    return errorResponse('Internal server error', 500);
  }
}

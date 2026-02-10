import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET - Get all goals for the organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        owner:users!goals_owner_id_fkey(id, name, email),
        creator:users!goals_created_by_fkey(id, name)
      `)
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get goals error:', error);
      return errorResponse('Failed to get goals', 500);
    }

    // Transform to camelCase
    const transformedGoals = goals?.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      type: g.type,
      status: g.status,
      progress: g.progress,
      startDate: g.start_date,
      endDate: g.end_date,
      ownerId: g.owner_id,
      owner: g.owner ? {
        id: g.owner.id,
        name: g.owner.name,
        email: g.owner.email,
      } : null,
      createdBy: g.created_by,
      creator: g.creator ? {
        id: g.creator.id,
        name: g.creator.name,
      } : null,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    })) || [];

    return jsonResponse({ goals: transformedGoals });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get goals error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { title, description, type, status, progress, startDate, endDate, ownerId } = body;

    // Validation
    if (!title?.trim()) {
      return errorResponse('Title is required', 400);
    }

    if (!type || !['annual', 'quarterly', 'monthly'].includes(type)) {
      return errorResponse('Valid type is required', 400);
    }

    // Create goal
    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        organization_id: user.organizationId,
        title: title.trim(),
        description: description?.trim() || null,
        type,
        status: status || 'not_started',
        progress: progress || 0,
        start_date: startDate || null,
        end_date: endDate || null,
        owner_id: ownerId || user.id,
        created_by: user.id,
      })
      .select(`
        *,
        owner:users!goals_owner_id_fkey(id, name, email),
        creator:users!goals_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create goal error:', error);
      return errorResponse('Failed to create goal', 500);
    }

    // Notify goal owner
    const goalOwnerId = ownerId || user.id;
    if (goalOwnerId !== user.id) {
      createNotification({
        userId: goalOwnerId,
        organizationId: user.organizationId,
        title: `هدف جديد: ${goal.title}`,
        message: `تم تعيين هدف جديد لك بواسطة ${user.name}`,
        type: 'goal',
      });
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
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Create goal error:', error);
    return errorResponse('Internal server error', 500);
  }
}

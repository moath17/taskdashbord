import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

/**
 * GET /api/dashboard
 * Returns tasks, goals, leaves, and trainings for the dashboard (read-only, no DB schema changes).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const orgId = user.organizationId;

    // Fetch tasks
    const tasksQuery = supabase
      .from('tasks')
      .select(`
        id, title, description, status, priority, assigned_to, due_date, created_at,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch goals
    const goalsQuery = supabase
      .from('goals')
      .select(`
        id, title, description, type, status, progress, start_date, end_date, created_at,
        owner:users!goals_owner_id_fkey(id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch leaves (role filter applied below)
    let leavesQuery = supabase
      .from('leaves')
      .select(`
        id, user_id, type, status, start_date, end_date, reason, created_at,
        user:users!leaves_user_id_fkey(id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (user.role === 'employee') {
      leavesQuery = leavesQuery.eq('user_id', user.id);
    }

    // Fetch trainings
    const trainingsQuery = supabase
      .from('trainings')
      .select(`
        id, title, type, status, start_date, end_date, provider, created_at,
        creator:users!trainings_created_by_fkey(id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20);

    const [tasksRes, goalsRes, leavesRes, trainingsRes] = await Promise.all([
      tasksQuery,
      goalsQuery,
      leavesQuery,
      trainingsQuery,
    ]);

    if (tasksRes.error) {
      console.error('Dashboard tasks error:', tasksRes.error);
      return errorResponse('Failed to load tasks', 500);
    }
    if (goalsRes.error) {
      console.error('Dashboard goals error:', goalsRes.error);
      return errorResponse('Failed to load goals', 500);
    }
    if (leavesRes.error) {
      console.error('Dashboard leaves error:', leavesRes.error);
      return errorResponse('Failed to load leaves', 500);
    }
    if (trainingsRes.error) {
      console.error('Dashboard trainings error:', trainingsRes.error);
      return errorResponse('Failed to load trainings', 500);
    }

    const tasks = (tasksRes.data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assigned_to,
      assignedUser: t.assigned_user ? { id: t.assigned_user.id, name: t.assigned_user.name, email: t.assigned_user.email } : null,
      dueDate: t.due_date,
      createdAt: t.created_at,
    }));

    const goals = (goalsRes.data || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      type: g.type,
      status: g.status,
      progress: g.progress ?? 0,
      startDate: g.start_date,
      endDate: g.end_date,
      ownerId: g.owner_id ?? g.owner?.id,
      owner: g.owner ? { id: g.owner.id, name: g.owner.name } : null,
      createdAt: g.created_at,
    }));

    const leaves = (leavesRes.data || []).map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      user: l.user ? { id: l.user.id, name: l.user.name } : null,
      type: l.type,
      status: l.status,
      startDate: l.start_date,
      endDate: l.end_date,
      reason: l.reason,
      createdAt: l.created_at,
    }));

    const trainings = (trainingsRes.data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      type: t.type,
      status: t.status,
      startDate: t.start_date,
      endDate: t.end_date,
      provider: t.provider,
      creator: t.creator ? { id: t.creator.id, name: t.creator.name } : null,
      createdAt: t.created_at,
    }));

    return jsonResponse({ tasks, goals, leaves, trainings });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Dashboard API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

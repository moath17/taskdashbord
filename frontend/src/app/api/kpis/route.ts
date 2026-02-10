import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET - Get all KPIs for the organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let query = supabase
      .from('kpis')
      .select(`
        *,
        owner:users!kpis_owner_id_fkey(id, name, email),
        creator:users!kpis_created_by_fkey(id, name)
      `)
      .eq('organization_id', user.organizationId);

    // Employees only see their own KPIs
    if (user.role === 'employee') {
      query = query.eq('owner_id', user.id);
    }

    const { data: kpis, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get KPIs error:', error);
      return errorResponse('Failed to get KPIs', 500);
    }

    // Transform to camelCase
    const transformedKpis = kpis?.map(k => ({
      id: k.id,
      name: k.name,
      description: k.description,
      unit: k.unit,
      targetValue: parseFloat(k.target_value),
      currentValue: parseFloat(k.current_value),
      frequency: k.frequency,
      category: k.category,
      status: k.status,
      ownerId: k.owner_id,
      owner: k.owner ? {
        id: k.owner.id,
        name: k.owner.name,
        email: k.owner.email,
      } : null,
      createdBy: k.created_by,
      creator: k.creator ? {
        id: k.creator.id,
        name: k.creator.name,
      } : null,
      startDate: k.start_date,
      endDate: k.end_date,
      createdAt: k.created_at,
      updatedAt: k.updated_at,
    })) || [];

    return jsonResponse({ kpis: transformedKpis });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get KPIs error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new KPI
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { name, description, unit, targetValue, currentValue, frequency, category, status, ownerId, startDate, endDate } = body;

    // Validation
    if (!name?.trim()) {
      return errorResponse('Name is required', 400);
    }

    // Create KPI
    const { data: kpi, error } = await supabase
      .from('kpis')
      .insert({
        organization_id: user.organizationId,
        name: name.trim(),
        description: description?.trim() || null,
        unit: unit || 'number',
        target_value: targetValue || 0,
        current_value: currentValue || 0,
        frequency: frequency || 'monthly',
        category: category?.trim() || null,
        status: status || 'on_track',
        owner_id: ownerId || user.id,
        created_by: user.id,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select(`
        *,
        owner:users!kpis_owner_id_fkey(id, name, email),
        creator:users!kpis_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create KPI error:', error);
      return errorResponse('Failed to create KPI', 500);
    }

    // Notify KPI owner
    const kpiOwnerId = ownerId || user.id;
    if (kpiOwnerId !== user.id) {
      createNotification({
        userId: kpiOwnerId,
        organizationId: user.organizationId,
        title: `مؤشر أداء جديد: ${kpi.name}`,
        message: `تم تعيين مؤشر أداء لك بواسطة ${user.name}`,
        type: 'kpi',
      });
    }

    return jsonResponse({
      kpi: {
        id: kpi.id,
        name: kpi.name,
        description: kpi.description,
        unit: kpi.unit,
        targetValue: parseFloat(kpi.target_value),
        currentValue: parseFloat(kpi.current_value),
        frequency: kpi.frequency,
        category: kpi.category,
        status: kpi.status,
        ownerId: kpi.owner_id,
        owner: kpi.owner ? {
          id: kpi.owner.id,
          name: kpi.owner.name,
          email: kpi.owner.email,
        } : null,
        createdBy: kpi.created_by,
        creator: kpi.creator ? {
          id: kpi.creator.id,
          name: kpi.creator.name,
        } : null,
        startDate: kpi.start_date,
        endDate: kpi.end_date,
        createdAt: kpi.created_at,
        updatedAt: kpi.updated_at,
      },
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Create KPI error:', error);
    return errorResponse('Internal server error', 500);
  }
}

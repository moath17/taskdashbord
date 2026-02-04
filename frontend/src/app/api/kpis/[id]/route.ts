import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, jsonResponse, errorResponse } from '@/lib/auth';

// GET - Get single KPI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const { data: kpi, error } = await supabase
      .from('kpis')
      .select(`
        *,
        owner:users!kpis_owner_id_fkey(id, name, email),
        creator:users!kpis_created_by_fkey(id, name)
      `)
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (error || !kpi) {
      return errorResponse('KPI not found', 404);
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
        owner: kpi.owner,
        createdBy: kpi.created_by,
        creator: kpi.creator,
        startDate: kpi.start_date,
        endDate: kpi.end_date,
        createdAt: kpi.created_at,
        updatedAt: kpi.updated_at,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get KPI error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Update KPI
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Check KPI exists and belongs to organization
    const { data: existing } = await supabase
      .from('kpis')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('KPI not found', 404);
    }

    const { name, description, unit, targetValue, currentValue, frequency, category, status, ownerId, startDate, endDate } = body;

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (unit !== undefined) updateData.unit = unit;
    if (targetValue !== undefined) updateData.target_value = targetValue;
    if (currentValue !== undefined) updateData.current_value = currentValue;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (ownerId !== undefined) updateData.owner_id = ownerId || null;
    if (startDate !== undefined) updateData.start_date = startDate || null;
    if (endDate !== undefined) updateData.end_date = endDate || null;

    // Update KPI
    const { data: kpi, error } = await supabase
      .from('kpis')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        owner:users!kpis_owner_id_fkey(id, name, email),
        creator:users!kpis_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Update KPI error:', error);
      return errorResponse('Failed to update KPI', 500);
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
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Update KPI error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete KPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Only owner/manager can delete KPIs
    if (user.role === 'employee') {
      return errorResponse('Not authorized to delete KPIs', 403);
    }

    // Check KPI exists and belongs to organization
    const { data: existing } = await supabase
      .from('kpis')
      .select('id')
      .eq('id', id)
      .eq('organization_id', user.organizationId)
      .single();

    if (!existing) {
      return errorResponse('KPI not found', 404);
    }

    // Delete KPI
    const { error } = await supabase
      .from('kpis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete KPI error:', error);
      return errorResponse('Failed to delete KPI', 500);
    }

    return jsonResponse({ message: 'KPI deleted successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Delete KPI error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get KPI by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const kpi = await db.kpis.getById(id);
    
    if (!kpi || kpi.organizationId !== user.organizationId) {
      return errorResponse('KPI not found', 404);
    }

    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;

    return jsonResponse({ ...kpi, achievementPercentage });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get KPI error:', error);
    return errorResponse('Failed to get KPI', 500);
  }
}

// Update KPI
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const kpi = await db.kpis.getById(id);
    
    if (!kpi || kpi.organizationId !== user.organizationId) {
      return errorResponse('KPI not found', 404);
    }

    const updatedKpi = await db.kpis.update(id, body);
    
    const achievementPercentage = updatedKpi.targetValue > 0 
      ? Math.round((updatedKpi.currentValue / updatedKpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return jsonResponse({ ...updatedKpi, achievementPercentage });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update KPI error:', error);
    return errorResponse('Failed to update KPI', 500);
  }
}

// Update KPI value (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    
    const kpi = await db.kpis.getById(id);
    
    if (!kpi || kpi.organizationId !== user.organizationId) {
      return errorResponse('KPI not found', 404);
    }

    const updatedKpi = await db.kpis.update(id, { currentValue: parseFloat(body.currentValue) });
    
    const achievementPercentage = updatedKpi.targetValue > 0 
      ? Math.round((updatedKpi.currentValue / updatedKpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return jsonResponse({ ...updatedKpi, achievementPercentage });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Update KPI value error:', error);
    return errorResponse('Failed to update KPI value', 500);
  }
}

// Delete KPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const kpi = await db.kpis.getById(id);
    
    if (!kpi || kpi.organizationId !== user.organizationId) {
      return errorResponse('KPI not found', 404);
    }

    await db.kpis.delete(id);
    return jsonResponse({ message: 'KPI deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete KPI error:', error);
    return errorResponse('Failed to delete KPI', 500);
  }
}

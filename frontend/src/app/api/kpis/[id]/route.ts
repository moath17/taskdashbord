import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get KPI by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    
    await db.read();
    const kpi = db.data.kpis.find(k => k.id === id);
    
    if (!kpi) {
      return errorResponse('KPI not found', 404);
    }

    const annualGoal = db.data.annualGoals.find(g => g.id === kpi.annualGoalId);
    const mboGoal = kpi.mboGoalId ? db.data.mboGoals.find(g => g.id === kpi.mboGoalId) : null;
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;

    return jsonResponse({
      ...kpi,
      annualGoalTitle: annualGoal?.title || 'Unknown',
      mboGoalTitle: mboGoal?.title || null,
      achievementPercentage,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get KPI', 500);
  }
}

// Update KPI (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const kpi = db.data.kpis.find(k => k.id === id);
    
    if (!kpi) {
      return errorResponse('KPI not found', 404);
    }

    const { title, description, unit, targetValue, currentValue, formula, frequency } = body;
    
    if (title) kpi.title = title;
    if (description !== undefined) kpi.description = description;
    if (unit) kpi.unit = unit;
    if (targetValue !== undefined) kpi.targetValue = parseFloat(targetValue);
    if (currentValue !== undefined) kpi.currentValue = parseFloat(currentValue);
    if (formula !== undefined) kpi.formula = formula;
    if (frequency) kpi.frequency = frequency;
    kpi.updatedAt = new Date().toISOString();

    await db.write();
    
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return jsonResponse({ ...kpi, achievementPercentage });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update KPI', 500);
  }
}

// Update KPI current value only (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    
    if (body.currentValue === undefined) {
      return errorResponse('currentValue is required', 400);
    }

    await db.read();
    const kpi = db.data.kpis.find(k => k.id === id);
    
    if (!kpi) {
      return errorResponse('KPI not found', 404);
    }

    kpi.currentValue = parseFloat(body.currentValue);
    kpi.updatedAt = new Date().toISOString();

    await db.write();
    
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return jsonResponse({ ...kpi, achievementPercentage });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to update KPI value', 500);
  }
}

// Delete KPI (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.kpis.findIndex(k => k.id === id);
    
    if (index === -1) {
      return errorResponse('KPI not found', 404);
    }

    db.data.kpis.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'KPI deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete KPI', 500);
  }
}

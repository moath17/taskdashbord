import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all KPIs
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    const kpis = await db.kpis.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    const mboGoals = await db.mboGoals.getByOrganization(user.organizationId);
    
    const kpisWithInfo = kpis.map((kpi: any) => {
      const annualGoal = annualGoals.find((g: any) => g.id === kpi.annualGoalId);
      const mboGoal = kpi.mboGoalId ? mboGoals.find((g: any) => g.id === kpi.mboGoalId) : null;
      const achievementPercentage = kpi.targetValue > 0 
        ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
        : 0;
      
      return {
        ...kpi,
        annualGoalTitle: annualGoal?.title || 'Unknown',
        mboGoalTitle: mboGoal?.title || null,
        achievementPercentage,
      };
    });
    
    return jsonResponse(kpisWithInfo);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get KPIs error:', error);
    return errorResponse('Failed to get KPIs', 500);
  }
}

// Create KPI
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { title, description, annualGoalId, mboGoalId, unit, targetValue, currentValue, formula, frequency } = body;

    if (!title || !annualGoalId || !unit || targetValue === undefined || !frequency) {
      return errorResponse('Missing required fields', 400);
    }

    const kpi = await db.kpis.create({
      organizationId: user.organizationId,
      title,
      description: description || '',
      annualGoalId,
      mboGoalId: mboGoalId || null,
      unit,
      targetValue: parseFloat(targetValue),
      currentValue: currentValue ? parseFloat(currentValue) : 0,
      formula: formula || '',
      frequency,
      createdBy: user.id,
    });

    return jsonResponse(kpi, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create KPI error:', error);
    return errorResponse('Failed to create KPI', 500);
  }
}

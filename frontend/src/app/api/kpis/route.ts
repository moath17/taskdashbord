import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { KPI } from '@/lib/types';

// Get all KPIs
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    await db.read();
    
    const kpis = db.data.kpis.map(kpi => {
      const annualGoal = db.data.annualGoals.find(g => g.id === kpi.annualGoalId);
      const mboGoal = kpi.mboGoalId ? db.data.mboGoals.find(g => g.id === kpi.mboGoalId) : null;
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
    
    return jsonResponse(kpis);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get KPIs', 500);
  }
}

// Create KPI (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, description, annualGoalId, mboGoalId, unit, targetValue, currentValue, formula, frequency } = body;

    if (!title || !annualGoalId || !unit || targetValue === undefined || !frequency) {
      return errorResponse('Missing required fields', 400);
    }

    await db.read();

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find(g => g.id === annualGoalId);
    if (!annualGoal) {
      return errorResponse('Annual goal not found', 400);
    }

    // Verify MBO goal if provided
    if (mboGoalId) {
      const mboGoal = db.data.mboGoals.find(g => g.id === mboGoalId);
      if (!mboGoal) {
        return errorResponse('MBO goal not found', 400);
      }
    }

    const kpi: KPI = {
      id: generateId(),
      title,
      description: description || '',
      annualGoalId,
      mboGoalId: mboGoalId || undefined,
      unit,
      targetValue: parseFloat(targetValue),
      currentValue: currentValue ? parseFloat(currentValue) : 0,
      formula: formula || '',
      frequency,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.kpis.push(kpi);
    await db.write();

    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return jsonResponse({ ...kpi, achievementPercentage }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create KPI', 500);
  }
}

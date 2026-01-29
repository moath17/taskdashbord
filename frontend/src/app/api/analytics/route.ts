import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get analytics data
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    await db.read();

    // Basic analytics data
    const analytics = {
      totalUsers: db.data.users.length,
      totalTasks: db.data.tasks.length,
      completedTasks: db.data.tasks.filter(t => t.status === 'Completed').length,
      totalGoals: db.data.annualGoals.length,
      totalKPIs: db.data.kpis.length,
      averageKPIAchievement: db.data.kpis.length > 0 
        ? db.data.kpis.reduce((sum, kpi) => {
            const achievement = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
            return sum + achievement;
          }, 0) / db.data.kpis.length
        : 0,
    };

    return jsonResponse(analytics);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get analytics', 500);
  }
}

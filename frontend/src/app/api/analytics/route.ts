import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get analytics data
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    const usersDb = getUsersDb();
    
    const users = await usersDb.users.getByOrganization(user.organizationId);
    const tasks = await db.tasks.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    const kpis = await db.kpis.getByOrganization(user.organizationId);

    const analytics = {
      totalUsers: users.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === 'Completed').length,
      totalGoals: annualGoals.length,
      totalKPIs: kpis.length,
      averageKPIAchievement: kpis.length > 0 
        ? kpis.reduce((sum: number, kpi: any) => {
            const achievement = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
            return sum + achievement;
          }, 0) / kpis.length
        : 0,
    };

    return jsonResponse(analytics);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get analytics error:', error);
    return errorResponse('Failed to get analytics', 500);
  }
}

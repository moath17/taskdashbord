import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get team workload analysis (managers only)
export async function GET(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const db = getDb();
    const usersDb = getUsersDb();
    
    const users = await usersDb.users.getByOrganization(user.organizationId);
    const tasks = await db.tasks.getByOrganization(user.organizationId);
    const annualGoals = await db.annualGoals.getByOrganization(user.organizationId);
    const mboGoals = await db.mboGoals.getByOrganization(user.organizationId);
    const now = new Date();
    
    // Analyze workload for each user
    const workloadAnalysis = users
      .filter((u: any) => u.role !== 'owner') // Exclude owner from workload analysis
      .map((u: any) => {
        const userTasks = tasks.filter((t: any) => t.assignedTo === u.id);
        const completedTasks = userTasks.filter((t: any) => t.status === 'Completed').length;
        const overdueTasks = userTasks.filter((t: any) => {
          const dueDate = new Date(t.dueDate);
          return dueDate < now && t.status !== 'Completed';
        }).length;
        
        // Calculate high risk goals for this user
        const userAnnualGoals = annualGoals.filter((g: any) => g.userId === u.id);
        const userMboGoals = mboGoals.filter((g: any) => g.userId === u.id);
        const allUserGoals = [...userAnnualGoals, ...userMboGoals];
        
        // Simple risk calculation based on overdue tasks
        const goalsAtRisk = allUserGoals.filter((g: any) => {
          const goalTasks = tasks.filter((t: any) => 
            t.annualGoalId === g.id || t.mboGoalId === g.id
          );
          const goalOverdue = goalTasks.filter((t: any) => {
            const dueDate = new Date(t.dueDate);
            return dueDate < now && t.status !== 'Completed';
          }).length;
          return goalOverdue > 0;
        }).length;
        
        // Calculate workload score (0-100)
        // Based on: active tasks, overdue ratio, capacity (assumed 10 tasks is optimal)
        const activeTasks = userTasks.filter((t: any) => t.status !== 'Completed').length;
        const optimalLoad = 10;
        const workloadScore = Math.min(100, Math.round((activeTasks / optimalLoad) * 100));
        
        let workloadStatus: 'underloaded' | 'optimal' | 'overloaded' = 'optimal';
        if (workloadScore < 40) {
          workloadStatus = 'underloaded';
        } else if (workloadScore > 80) {
          workloadStatus = 'overloaded';
        }
        
        return {
          userId: u.id,
          userName: u.name,
          totalAssignedTasks: userTasks.length,
          completedTasks,
          overdueTasks,
          workloadScore,
          workloadStatus,
          goalsAtRisk,
        };
      });
    
    return jsonResponse(workloadAnalysis);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Get workload analysis error:', error);
    return errorResponse('Failed to get workload analysis', 500);
  }
}

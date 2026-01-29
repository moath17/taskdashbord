import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update vacation plan status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    if (!['pending', 'approved', 'rejected'].includes(body.status)) {
      return errorResponse('Invalid status', 400);
    }

    const plan = await db.vacationPlans.getById(id);
    
    if (!plan || plan.organizationId !== user.organizationId) {
      return errorResponse('Vacation plan not found', 404);
    }

    const updatedPlan = await db.vacationPlans.update(id, { status: body.status });
    return jsonResponse(updatedPlan);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update vacation status error:', error);
    return errorResponse('Failed to update status', 500);
  }
}

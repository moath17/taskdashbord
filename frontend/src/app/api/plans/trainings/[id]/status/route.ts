import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { createNotification } from '@/lib/notifications-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update training plan status
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

    const plan = await db.trainingPlans.getById(id);
    
    if (!plan || plan.organizationId !== user.organizationId) {
      return errorResponse('Training plan not found', 404);
    }

    const updatedPlan = await db.trainingPlans.update(id, { status: body.status });

    if (plan.userId && plan.userId !== user.id && body.status !== 'pending') {
      try {
        createNotification({
          userId: plan.userId,
          organizationId: user.organizationId,
          type: body.status === 'approved' ? 'plan_approved' : 'plan_rejected',
          title: body.status === 'approved' ? 'Training approved' : 'Training rejected',
          message: body.status === 'approved'
            ? 'Your training plan has been approved'
            : 'Your training plan has been rejected',
          link: '/plans',
        });
      } catch (_) {}
    }

    return jsonResponse(updatedPlan);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update training status error:', error);
    return errorResponse('Failed to update status', 500);
  }
}

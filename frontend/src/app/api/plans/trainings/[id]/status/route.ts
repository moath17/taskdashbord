import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update training plan status (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    if (!['pending', 'approved', 'rejected'].includes(body.status)) {
      return errorResponse('Invalid status', 400);
    }

    await db.read();
    const planIndex = db.data.trainingPlans.findIndex((p) => p.id === id);
    
    if (planIndex === -1) {
      return errorResponse('Training plan not found', 404);
    }

    db.data.trainingPlans[planIndex].status = body.status;
    db.data.trainingPlans[planIndex].updatedAt = new Date().toISOString();
    await db.write();

    return jsonResponse(db.data.trainingPlans[planIndex]);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update status', 500);
  }
}

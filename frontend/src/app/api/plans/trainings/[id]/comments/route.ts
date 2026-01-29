import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Add comment to training plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    
    if (!body.content?.trim()) {
      return errorResponse('Content is required', 400);
    }

    const plan = await db.trainingPlans.getById(id);
    
    if (!plan || plan.organizationId !== user.organizationId) {
      return errorResponse('Training plan not found', 404);
    }

    const comment = await db.comments.create({
      organizationId: user.organizationId,
      trainingPlanId: id,
      userId: user.id,
      content: body.content,
    });

    return jsonResponse({
      ...comment,
      user: { id: user.id, name: user.name },
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Add comment error:', error);
    return errorResponse('Failed to add comment', 500);
  }
}

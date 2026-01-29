import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';

// Add comment to vacation plan
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

    await db.read();
    const plan = db.data.vacationPlans.find((p) => p.id === id);
    
    if (!plan) {
      return errorResponse('Vacation plan not found', 404);
    }

    const comment = {
      id: generateId(),
      vacationPlanId: id,
      userId: user.id,
      content: body.content,
      createdAt: new Date().toISOString(),
    };

    db.data.comments.push(comment);
    await db.write();

    const commentUser = db.data.users.find((u) => u.id === user.id);
    return jsonResponse({
      ...comment,
      user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to add comment', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    
    await db.read();
    const proposal = db.data.proposals.find((p) => p.id === id);
    
    if (!proposal) {
      return errorResponse('Proposal not found', 404);
    }

    const user = db.data.users.find((u) => u.id === proposal.createdBy);
    return jsonResponse({ ...proposal, createdByName: user?.name || 'Unknown' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get proposal', 500);
  }
}

// Update proposal (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    const body = await request.json();
    
    await db.read();
    const proposal = db.data.proposals.find((p) => p.id === id);
    
    if (!proposal) {
      return errorResponse('Proposal not found', 404);
    }

    const { title, description, type, imageUrl, link, isHighlighted } = body;

    if (title) proposal.title = title;
    if (description) proposal.description = description;
    if (type) proposal.type = type;
    if (imageUrl !== undefined) proposal.imageUrl = imageUrl || undefined;
    if (link !== undefined) proposal.link = link || undefined;
    if (isHighlighted !== undefined) proposal.isHighlighted = isHighlighted;
    proposal.updatedAt = new Date().toISOString();

    await db.write();
    return jsonResponse(proposal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to update proposal', 500);
  }
}

// Delete proposal (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const index = db.data.proposals.findIndex((p) => p.id === id);
    
    if (index === -1) {
      return errorResponse('Proposal not found', 404);
    }

    db.data.proposals.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'Proposal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete proposal', 500);
  }
}

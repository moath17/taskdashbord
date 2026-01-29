import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const proposal = await db.proposals.getById(id);
    
    if (!proposal || proposal.organizationId !== user.organizationId) {
      return errorResponse('Proposal not found', 404);
    }

    return jsonResponse(proposal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get proposal error:', error);
    return errorResponse('Failed to get proposal', 500);
  }
}

// Update proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    const proposal = await db.proposals.getById(id);
    
    if (!proposal || proposal.organizationId !== user.organizationId) {
      return errorResponse('Proposal not found', 404);
    }

    const updatedProposal = await db.proposals.update(id, body);
    return jsonResponse(updatedProposal);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update proposal error:', error);
    return errorResponse('Failed to update proposal', 500);
  }
}

// Delete proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireOwnerOrManager(request);
    const { id } = await params;
    
    const proposal = await db.proposals.getById(id);
    
    if (!proposal || proposal.organizationId !== user.organizationId) {
      return errorResponse('Proposal not found', 404);
    }

    await db.proposals.delete(id);
    return jsonResponse({ message: 'Proposal deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete proposal error:', error);
    return errorResponse('Failed to delete proposal', 500);
  }
}

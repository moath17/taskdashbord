import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { Proposal } from '@/lib/types';

// Get all proposals
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    await db.read();
    const proposals = db.data.proposals.map((proposal) => {
      const user = db.data.users.find((u) => u.id === proposal.createdBy);
      return { ...proposal, createdByName: user?.name || 'Unknown' };
    });
    
    return jsonResponse(proposals);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to get proposals', 500);
  }
}

// Create proposal (Manager only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, 'manager');
    const body = await request.json();
    
    const { title, description, type, imageUrl, link, isHighlighted } = body;

    if (!title || !description || !type) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['course', 'article', 'instruction', 'other'].includes(type)) {
      return errorResponse('Invalid type', 400);
    }

    await db.read();

    const proposal: Proposal = {
      id: generateId(),
      title,
      description,
      type,
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl : undefined,
      link: link && link.trim() !== '' ? link : undefined,
      isHighlighted: isHighlighted || false,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.proposals.push(proposal);
    await db.write();

    return jsonResponse(proposal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create proposal', 500);
  }
}

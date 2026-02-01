import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth, requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get all proposals
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const db = getDb();
    const usersDb = getUsersDb();
    
    const proposals = await db.proposals.getByOrganization(user.organizationId);
    const users = await usersDb.users.getByOrganization(user.organizationId);
    
    const proposalsWithUsers = proposals.map((proposal: any) => {
      const proposalUser = users.find((u: any) => u.id === proposal.createdBy);
      return { ...proposal, createdByName: proposalUser?.name || 'Unknown' };
    });
    
    return jsonResponse(proposalsWithUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get proposals error:', error);
    return errorResponse('Failed to get proposals', 500);
  }
}

// Create proposal
export async function POST(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const body = await request.json();
    const db = getDb();
    
    const { title, description, type, imageUrl, link, isHighlighted } = body;

    if (!title || !description || !type) {
      return errorResponse('Missing required fields', 400);
    }

    const proposal = await db.proposals.create({
      organizationId: user.organizationId,
      title,
      description,
      type,
      imageUrl: imageUrl || null,
      link: link || null,
      isHighlighted: isHighlighted || false,
      createdBy: user.id,
    });

    return jsonResponse(proposal, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Create proposal error:', error);
    return errorResponse('Failed to create proposal', 500);
  }
}

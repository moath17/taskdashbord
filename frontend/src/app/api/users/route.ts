import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all users in organization (redirect to /api/team)
export async function GET(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    
    const users = await db.users.getByOrganization(user.organizationId);
    
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));
    
    return jsonResponse(safeUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Get users error:', error);
    return errorResponse('Failed to get users', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('No token provided', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }

    const user = await db.users.getById(decoded.userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const organization = await db.organizations.getById(user.organizationId);

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: organization?.name || 'Unknown',
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}

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

    await db.read();
    const user = db.data.users.find((u) => u.id === decoded.userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}

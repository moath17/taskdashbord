import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/auth';
import { verifyAdminPassword, setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return errorResponse('Password is required', 400);
    }

    if (!verifyAdminPassword(password)) {
      return errorResponse('Invalid password', 401);
    }

    const response = jsonResponse({ message: 'Admin authenticated' });
    return setAdminCookie(response);
  } catch (error) {
    console.error('Admin login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

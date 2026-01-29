import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Admin password - in production, use environment variable
const ADMIN_PASSWORD = 'Majed@123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return errorResponse('Password is required', 400);
    }

    if (password !== ADMIN_PASSWORD) {
      return errorResponse('Invalid password', 401);
    }

    // Return a simple token for session management
    const adminToken = Buffer.from(`admin:${Date.now()}`).toString('base64');

    return jsonResponse({ 
      success: true,
      token: adminToken 
    });
  } catch (error: any) {
    console.error('Admin auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}

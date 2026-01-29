import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { comparePassword, generateToken, updateUserActivity } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Missing email or password', 400);
    }

    // Find user by email (could be in multiple orgs, but email is unique globally now)
    const users = await db.users.getByEmail(email);
    
    if (users.length === 0) {
      return errorResponse('Invalid credentials', 401);
    }

    // For simplicity, we'll use the first match (email is unique per org)
    const user = users[0];

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Get organization name
    const organization = await db.organizations.getById(user.organizationId);

    // Update user's last activity on login
    updateUserActivity(user.id);

    const token = generateToken(user.id, user.email, user.role, user.organizationId, user.name);
    
    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: organization?.name || 'Unknown',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed', 500);
  }
}

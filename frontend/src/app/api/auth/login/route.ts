import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { comparePassword, generateToken, updateUserActivity } from '@/lib/auth';
import { getInvitationByEmail } from '@/lib/invites-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => (isSupabaseConfigured() ? db : localAuthDb);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Missing email or password', 400);
    }

    const authDb = getDb();

    // Find user by email (could be in multiple orgs, but email is unique globally now)
    const users = await authDb.users.getByEmail(email);
    
    if (users.length === 0) {
      return errorResponse('Invalid credentials', 401);
    }

    const user = users[0];

    const pendingInvite = getInvitationByEmail(user.email);
    if (pendingInvite) {
      return errorResponse('Please use the invitation link sent to your email to set up your password', 403);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Get organization name
    const organization = await authDb.organizations.getById(user.organizationId);

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
        ownerAlsoAdmin: (user as any).ownerAlsoAdmin ?? false,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed', 500);
  }
}

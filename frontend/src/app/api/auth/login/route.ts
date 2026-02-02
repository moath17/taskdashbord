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

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/15cdbcca-ca79-4c98-8d4a-d1a85d74555c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/route.ts:POST',message:'Login attempt',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A-login'})}).catch(()=>{});
    // #endregion

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

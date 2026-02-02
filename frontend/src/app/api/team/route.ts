import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireOwnerOrManager, hashPassword } from '@/lib/auth';
import { createInvitation } from '@/lib/invites-store';
import { sendInviteEmail } from '@/lib/email';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => (isSupabaseConfigured() ? db : localAuthDb);

// Placeholder password for invited users - they must set password via invite link
const PENDING_PASSWORD = '__PENDING_INVITE__';

// Get all team members in the organization
export async function GET(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    const authDb = getDb();
    const users = await authDb.users.getByOrganization(user.organizationId);
    
    // Remove passwords from response
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
    console.error('Get team error:', error);
    return errorResponse('Failed to get team members', 500);
  }
}

// Add a new team member (invite flow - no password, user sets their own)
export async function POST(request: NextRequest) {
  try {
    const authUser = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { email, name, role } = body;

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/15cdbcca-ca79-4c98-8d4a-d1a85d74555c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'team/route.ts:POST',message:'Create team member',data:{email,name,role,createdBy:authUser.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B-team'})}).catch(()=>{});
    // #endregion

    if (!email || !name || !role) {
      return errorResponse('Missing required fields: email, name, role', 400);
    }

    if (!['manager', 'employee'].includes(role)) {
      return errorResponse('Role must be manager or employee', 400);
    }

    const authDb = getDb();

    const existingUsers = await authDb.users.getByEmail(email);
    if (existingUsers.length > 0) {
      return errorResponse('Email already in use', 400);
    }

    const hashedPlaceholder = await hashPassword(PENDING_PASSWORD);
    const newUser = await authDb.users.create({
      organizationId: authUser.organizationId,
      email,
      password: hashedPlaceholder,
      name,
      role,
    });

    const invite = createInvitation({
      token: crypto.randomUUID(),
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      organizationId: authUser.organizationId,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const setupLink = `${baseUrl}/setup-password?token=${invite.token}`;

    const emailSent = await sendInviteEmail(email, name, setupLink);

    return jsonResponse({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      inviteLink: emailSent ? undefined : setupLink,
      emailSent: !!emailSent,
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Add team member error:', error);
    return errorResponse(error.message || 'Failed to add team member', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth, hashPassword } from '@/lib/auth';
import { createInvitation } from '@/lib/invites-store';
import { sendInviteEmail } from '@/lib/email';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => (isSupabaseConfigured() ? db : localAuthDb);
const PENDING_PASSWORD = '__PENDING_INVITE__';

/**
 * Optional admin setup after owner registration.
 * Option A: Use same email as Owner for Admin → set ownerAlsoAdmin=true
 * Option B: Create new Admin with different email → create manager user + invite
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'owner') {
      return errorResponse('Only owners can perform admin setup', 403);
    }

    const body = await request.json();
    const { useSameAsOwner, adminEmail, adminName } = body;

    if (useSameAsOwner === true) {
      const authDb = getDb();
      await authDb.users.update(user.id, { ownerAlsoAdmin: true });
      const updated = await authDb.users.getById(user.id);
      return jsonResponse({
        success: true,
        ownerAlsoAdmin: true,
        user: {
          id: updated?.id,
          email: updated?.email,
          name: updated?.name,
          role: updated?.role,
          organizationId: updated?.organizationId,
          ownerAlsoAdmin: true,
        },
      });
    }

    if (useSameAsOwner === false && adminEmail && adminName) {
      const authDb = getDb();
      const existingUsers = await authDb.users.getByEmail(adminEmail);
      if (existingUsers.length > 0) {
        return errorResponse('Email already in use', 400);
      }

      const hashedPlaceholder = await hashPassword(PENDING_PASSWORD);
      const newUser = await authDb.users.create({
        organizationId: user.organizationId,
        email: adminEmail,
        password: hashedPlaceholder,
        name: adminName,
        role: 'manager',
      });

      const invite = createInvitation({
        token: crypto.randomUUID(),
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        organizationId: user.organizationId,
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const setupLink = `${baseUrl}/setup-password?token=${invite.token}`;
      const emailSent = await sendInviteEmail(adminEmail, adminName, setupLink);

      return jsonResponse({
        success: true,
        ownerAlsoAdmin: false,
        adminCreated: true,
        inviteLink: emailSent ? undefined : setupLink,
        emailSent: !!emailSent,
      });
    }

    return errorResponse('Invalid request. Provide useSameAsOwner or adminEmail+adminName', 400);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Setup admin error:', error);
    return errorResponse(error.message || 'Failed to setup admin', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { createResetToken } from '@/lib/reset-tokens-store';
import { sendResetPasswordEmail } from '@/lib/email';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => (isSupabaseConfigured() ? db : localAuthDb);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const authDb = getDb();
    const users = await authDb.users.getByEmail(email);

    if (users.length === 0) {
      return jsonResponse({ message: 'If an account exists with this email, you will receive a reset link' });
    }

    const user = users[0];

    const pendingInvite = (await import('@/lib/invites-store')).getInvitationByEmail(user.email);
    if (pendingInvite) {
      return errorResponse('Please use the invitation link sent to your email to set up your password first', 400);
    }

    const resetToken = createResetToken(user.id, user.email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken.token}`;

    const emailSent = await sendResetPasswordEmail(user.email, resetLink);

    return jsonResponse({
      success: true,
      message: emailSent
        ? 'If an account exists with this email, you will receive a reset link'
        : 'Reset link generated. Configure RESEND_API_KEY to send emails.',
      resetLink: emailSent ? undefined : resetLink,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse('Failed to process request', 500);
  }
}

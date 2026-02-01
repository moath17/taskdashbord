import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { hashPassword } from '@/lib/auth';
import { getResetToken, deleteResetToken } from '@/lib/reset-tokens-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => (isSupabaseConfigured() ? db : localAuthDb);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return errorResponse('Token and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const resetToken = getResetToken(token);
    if (!resetToken) {
      return errorResponse('Invalid or expired link', 404);
    }

    const authDb = getDb();
    const hashedPassword = await hashPassword(password);
    await authDb.users.update(resetToken.userId, { password: hashedPassword });
    deleteResetToken(token);

    return jsonResponse({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return errorResponse('Failed to reset password', 500);
  }
}

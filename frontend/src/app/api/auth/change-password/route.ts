import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, hashPassword, verifyPassword, jsonResponse, errorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password
 * Allows any logged-in user to change their own password.
 * Requires: currentPassword, newPassword
 * No email sent, only updates the password column for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters', 400);
    }

    // Get current hashed password from DB
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('id, password')
      .eq('id', user.id)
      .single();

    if (fetchError || !dbUser) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, dbUser.password);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password and update
    const hashedNew = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNew, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('Change password update error:', updateError);
      return errorResponse('Failed to update password', 500);
    }

    return jsonResponse({ message: 'Password changed successfully' });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Change password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

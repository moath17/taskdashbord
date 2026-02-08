import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, jsonResponse, errorResponse } from '@/lib/auth';

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

    // Find user by reset token
    const { data: users, error } = await supabase
      .from('users')
      .select('id, reset_token, reset_token_expires')
      .eq('reset_token', token);

    if (error) {
      console.error('Reset password query error:', error);
      return errorResponse('Internal server error', 500);
    }

    if (!users || users.length === 0) {
      return errorResponse('Invalid or expired reset link', 400);
    }

    const user = users[0];

    // Check if token has expired
    if (new Date(user.reset_token_expires) < new Date()) {
      // Clear expired token
      await supabase
        .from('users')
        .update({ reset_token: null, reset_token_expires: null })
        .eq('id', user.id);

      return errorResponse('Reset link has expired. Please request a new one.', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return errorResponse('Internal server error', 500);
    }

    return jsonResponse({
      message: 'Password has been reset successfully.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

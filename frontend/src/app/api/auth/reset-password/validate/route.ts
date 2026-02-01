import { NextRequest } from 'next/server';
import { getResetToken } from '@/lib/reset-tokens-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const resetToken = getResetToken(token);
    if (!resetToken) {
      return errorResponse('Invalid or expired link', 404);
    }

    return jsonResponse({
      valid: true,
      email: resetToken.email,
    });
  } catch (error: any) {
    console.error('Validate reset token error:', error);
    return errorResponse('Failed to validate', 500);
  }
}

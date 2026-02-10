import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Forgot password: no email sent, no DB write.
 * User is told to contact the manager/owner to reset password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.email) {
      return errorResponse('Email is required', 400);
    }

    // No DB access, no email sending — just return the message
    return jsonResponse({
      message: 'Please contact the manager (or owner) to reset your password.',
      messageAr: 'الرجاء الرجوع إلى المدير (أو المالك) لتغيير كلمة المرور.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

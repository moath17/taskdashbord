import { NextRequest } from 'next/server';
import { getInvitationByToken } from '@/lib/invites-store';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const invite = getInvitationByToken(token);
    if (!invite) {
      return errorResponse('Invalid or expired link', 404);
    }

    return jsonResponse({
      valid: true,
      email: invite.email,
      name: invite.name,
    });
  } catch (error: any) {
    console.error('Validate invite error:', error);
    return errorResponse('Failed to validate invite', 500);
  }
}

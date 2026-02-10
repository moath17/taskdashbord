import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, jsonResponse, errorResponse } from '@/lib/auth';

const ADMIN_PASSWORD = '***REMOVED***';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Admin ', '');
  return password === ADMIN_PASSWORD;
}

// PUT - Reset a user's password (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return errorResponse('userId and newPassword are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Verify user belongs to this organization
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, organization_id')
      .eq('id', userId)
      .eq('organization_id', id)
      .single();

    if (fetchError || !user) {
      return errorResponse('User not found', 404);
    }

    // Hash and update password
    const hashed = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Admin reset password error:', updateError);
      return errorResponse('Failed to reset password', 500);
    }

    return jsonResponse({ message: `Password reset for ${user.name} (${user.email})` });

  } catch (error: any) {
    console.error('Admin reset password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete an organization and all its data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check organization exists
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!org) {
      return errorResponse('Organization not found', 404);
    }

    // Delete organization (CASCADE will delete all related data)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete organization error:', error);
      return errorResponse('Failed to delete organization', 500);
    }

    return jsonResponse({ message: `Organization "${org.name}" deleted successfully` });

  } catch (error: any) {
    console.error('Admin delete org error:', error);
    return errorResponse('Internal server error', 500);
  }
}

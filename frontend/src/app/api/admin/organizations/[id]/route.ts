import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/auth';

const ADMIN_PASSWORD = '***REMOVED***';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Admin ', '');
  return password === ADMIN_PASSWORD;
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

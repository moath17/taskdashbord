import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Helper to check if admin token is valid
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith('admin:');
  } catch {
    return false;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    if (!verifyAdminToken(request)) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = params;

    // First, delete all users in this organization
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .eq('organization_id', id);

    if (usersError) {
      console.error('Delete users error:', usersError);
      return errorResponse('Failed to delete organization users', 500);
    }

    // Delete all related data (tasks, goals, etc.)
    // These should cascade delete if foreign keys are set up correctly
    // But we'll do it explicitly to be safe

    // Delete tasks
    await supabase.from('tasks').delete().eq('organization_id', id);
    
    // Delete annual goals
    await supabase.from('annual_goals').delete().eq('organization_id', id);
    
    // Delete MBO goals
    await supabase.from('mbo_goals').delete().eq('organization_id', id);
    
    // Delete KPIs
    await supabase.from('kpis').delete().eq('organization_id', id);
    
    // Delete vacation plans
    await supabase.from('vacation_plans').delete().eq('organization_id', id);
    
    // Delete training plans
    await supabase.from('training_plans').delete().eq('organization_id', id);
    
    // Delete calendar events
    await supabase.from('calendar_events').delete().eq('organization_id', id);
    
    // Delete proposals
    await supabase.from('proposals').delete().eq('organization_id', id);
    
    // Delete weekly updates
    await supabase.from('weekly_updates').delete().eq('organization_id', id);

    // Finally, delete the organization
    const { error: orgError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (orgError) {
      console.error('Delete organization error:', orgError);
      return errorResponse('Failed to delete organization', 500);
    }

    return jsonResponse({ success: true, message: 'Organization deleted successfully' });
  } catch (error: any) {
    console.error('Admin delete organization error:', error);
    return errorResponse('Failed to delete organization', 500);
  }
}

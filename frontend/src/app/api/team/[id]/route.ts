import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager, hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireOwnerOrManager(request);
    const { id } = await params;
    const body = await request.json();
    
    // Get the user to update
    const user = await db.users.getById(id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Ensure user belongs to same organization
    if (user.organizationId !== authUser.organizationId) {
      return errorResponse('Forbidden', 403);
    }

    // Can't demote owner
    if (user.role === 'owner' && body.role && body.role !== 'owner') {
      return errorResponse('Cannot change owner role', 400);
    }

    // Build update data
    const updateData: any = {};
    if (body.email) updateData.email = body.email;
    if (body.name) updateData.name = body.name;
    if (body.role && user.role !== 'owner') updateData.role = body.role;
    if (body.password) updateData.password = await hashPassword(body.password);

    const updatedUser = await db.users.update(id, updateData);

    return jsonResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Update team member error:', error);
    return errorResponse('Failed to update team member', 500);
  }
}

// Delete a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireOwnerOrManager(request);
    const { id } = await params;
    
    // Get the user to delete
    const user = await db.users.getById(id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Ensure user belongs to same organization
    if (user.organizationId !== authUser.organizationId) {
      return errorResponse('Forbidden', 403);
    }

    // Can't delete owner
    if (user.role === 'owner') {
      return errorResponse('Cannot delete organization owner', 400);
    }

    // Can't delete yourself
    if (user.id === authUser.id) {
      return errorResponse('Cannot delete yourself', 400);
    }

    await db.users.delete(id);

    return jsonResponse({ message: 'Team member deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete team member error:', error);
    return errorResponse('Failed to delete team member', 500);
  }
}

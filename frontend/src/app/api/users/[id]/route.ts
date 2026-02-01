import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { localAuthDb, isSupabaseConfigured } from '@/lib/local-auth-db';
import { requireAuth, requireOwnerOrManager, hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

const getDb = () => getDatabase();
const getUsersDb = () => isSupabaseConfigured() ? getDatabase() : localAuthDb;

// Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireAuth(request);
    const { id } = await params;
    const usersDb = getUsersDb();
    
    const user = await usersDb.users.getById(id);
    
    if (!user || user.organizationId !== authUser.organizationId) {
      return errorResponse('User not found', 404);
    }

    // Employees can only view their own profile
    if (authUser.role === 'employee' && authUser.id !== id) {
      return errorResponse('Forbidden', 403);
    }

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const usersDb = getUsersDb();
    
    const user = await usersDb.users.getById(id);
    
    if (!user || user.organizationId !== authUser.organizationId) {
      return errorResponse('User not found', 404);
    }

    // Employees can only update their own profile
    if (authUser.role === 'employee' && authUser.id !== id) {
      return errorResponse('Forbidden', 403);
    }

    // Only owner/manager can change roles
    if (body.role && !['owner', 'manager'].includes(authUser.role)) {
      return errorResponse('Only owners/managers can change user roles', 403);
    }

    // Can't change owner role
    if (user.role === 'owner' && body.role && body.role !== 'owner') {
      return errorResponse('Cannot change owner role', 400);
    }

    const updateData: any = {};
    if (body.email) updateData.email = body.email;
    if (body.name) updateData.name = body.name;
    if (body.role && user.role !== 'owner') updateData.role = body.role;
    if (body.password) updateData.password = await hashPassword(body.password);

    const updatedUser = await usersDb.users.update(id, updateData);

    return jsonResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Update user error:', error);
    return errorResponse('Failed to update user', 500);
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireOwnerOrManager(request);
    const { id } = await params;
    const usersDb = getUsersDb();
    
    const user = await usersDb.users.getById(id);
    
    if (!user || user.organizationId !== authUser.organizationId) {
      return errorResponse('User not found', 404);
    }

    // Can't delete owner
    if (user.role === 'owner') {
      return errorResponse('Cannot delete organization owner', 400);
    }

    // Can't delete yourself
    if (user.id === authUser.id) {
      return errorResponse('Cannot delete yourself', 400);
    }

    await usersDb.users.delete(id);
    return jsonResponse({ message: 'User deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Delete user error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}

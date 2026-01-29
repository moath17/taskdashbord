import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireAuth, requireRole, hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    await db.read();
    const targetUser = db.data.users.find((u) => u.id === id);
    
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Employees can only view their own profile
    if (user.role === 'employee' && user.id !== id) {
      return errorResponse('Forbidden', 403);
    }

    return jsonResponse({
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      createdAt: targetUser.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
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
    
    await db.read();
    const user = db.data.users.find((u) => u.id === id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Employees can only update their own profile
    if (authUser.role === 'employee' && authUser.id !== id) {
      return errorResponse('Forbidden', 403);
    }

    // Only manager can change roles
    if (body.role && authUser.role !== 'manager') {
      return errorResponse('Only managers can change user roles', 403);
    }

    // If changing to manager role, check if one already exists
    if (body.role === 'manager' && user.role !== 'manager') {
      const existingManager = db.data.users.find((u) => u.role === 'manager' && u.id !== user.id);
      if (existingManager) {
        return errorResponse('A manager already exists. Only one manager is allowed.', 400);
      }
    }

    const { email, password, name, role } = body;

    if (email) {
      const existingUser = db.data.users.find((u) => u.email === email && u.id !== user.id);
      if (existingUser) {
        return errorResponse('Email already in use', 400);
      }
      user.email = email;
    }
    if (password) {
      user.password = await hashPassword(password);
    }
    if (name) user.name = name;
    if (role && authUser.role === 'manager') user.role = role;

    await db.write();

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to update user', 500);
  }
}

// Delete user (Manager only, cannot delete self)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = requireRole(request, 'manager');
    const { id } = await params;
    
    await db.read();
    const user = db.data.users.find((u) => u.id === id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (authUser.id === id) {
      return errorResponse('Cannot delete your own account', 400);
    }

    const index = db.data.users.findIndex((u) => u.id === id);
    db.data.users.splice(index, 1);
    await db.write();

    return jsonResponse({ message: 'User deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to delete user', 500);
  }
}

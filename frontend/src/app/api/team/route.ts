import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireOwnerOrManager, hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get all team members in the organization
export async function GET(request: NextRequest) {
  try {
    const user = requireOwnerOrManager(request);
    
    const users = await db.users.getByOrganization(user.organizationId);
    
    // Remove passwords from response
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));
    
    return jsonResponse(safeUsers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Get team error:', error);
    return errorResponse('Failed to get team members', 500);
  }
}

// Add a new team member
export async function POST(request: NextRequest) {
  try {
    const authUser = requireOwnerOrManager(request);
    const body = await request.json();
    
    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return errorResponse('Missing required fields: email, password, name, role', 400);
    }

    if (!['manager', 'employee'].includes(role)) {
      return errorResponse('Role must be manager or employee', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Check if email already exists globally
    const existingUsers = await db.users.getByEmail(email);
    if (existingUsers.length > 0) {
      return errorResponse('Email already in use', 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await db.users.create({
      organizationId: authUser.organizationId,
      email,
      password: hashedPassword,
      name,
      role,
    });

    return jsonResponse({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    console.error('Add team member error:', error);
    return errorResponse(error.message || 'Failed to add team member', 500);
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { requireRole, hashPassword } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { User } from '@/lib/types';

// Get all users (Manager only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, 'manager');
    
    await db.read();
    const users = db.data.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }));
    
    return jsonResponse(users);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to get users', 500);
  }
}

// Create user (Manager only)
export async function POST(request: NextRequest) {
  try {
    requireRole(request, 'manager');
    
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return errorResponse('Missing required fields', 400);
    }

    await db.read();

    const existingUser = db.data.users.find((u) => u.email === email);
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    if (role === 'manager') {
      const existingManager = db.data.users.find((u) => u.role === 'manager');
      if (existingManager) {
        return errorResponse('A manager already exists. Only one manager is allowed.', 400);
      }
    }

    const hashedPassword = await hashPassword(password);
    const user: User = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);
    await db.write();

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Failed to create user', 500);
  }
}

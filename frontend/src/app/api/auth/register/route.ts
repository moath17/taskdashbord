import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';
import { generateId, jsonResponse, errorResponse } from '@/lib/utils';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['manager', 'employee'].includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    await db.read();
    
    const existingUser = db.data.users.find((u) => u.email === email);
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    // Check if manager already exists when trying to register as manager
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

    const token = generateToken(user.id, user.email, user.role);
    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Registration failed', 500);
  }
}

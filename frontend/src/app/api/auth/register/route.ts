import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationName, email, password, name } = body;

    // Validation
    if (!organizationName || !email || !password || !name) {
      return errorResponse('Missing required fields: organizationName, email, password, name', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Check if email already exists in any organization
    const existingUsers = await db.users.getByEmail(email);
    if (existingUsers.length > 0) {
      return errorResponse('Email already registered', 400);
    }

    // Create the organization
    const organization = await db.organizations.create({
      name: organizationName,
    });

    // Hash password and create owner user
    const hashedPassword = await hashPassword(password);
    const user = await db.users.create({
      organizationId: organization.id,
      email,
      password: hashedPassword,
      name,
      role: 'owner',
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role, user.organizationId, user.name);

    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: organization.name,
      },
    }, 201);
  } catch (error: any) {
    console.error('Register error:', error);
    return errorResponse(error.message || 'Registration failed', 500);
  }
}

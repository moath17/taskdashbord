import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { comparePassword, generateToken } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Missing email or password', 400);
    }

    await db.read();
    
    const user = db.data.users.find((u) => u.email === email);
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken(user.id, user.email, user.role);
    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}

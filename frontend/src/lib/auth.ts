import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { User } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || '***REMOVED***'
);

// =============================================
// Password utilities
// =============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// =============================================
// JWT utilities
// =============================================

export async function createToken(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// =============================================
// Auth middleware helpers
// =============================================

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    throw new Error('Unauthorized');
  }
  
  return payload as User;
}

// =============================================
// Response helpers
// =============================================

export function jsonResponse(data: any, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { User } from './types';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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
    .setExpirationTime(process.env.JWT_EXPIRATION || '7d')
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

const COOKIE_NAME = '__td_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function getTokenFromRequest(request: NextRequest): string | null {
  const fromCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (fromCookie) return fromCookie;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
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

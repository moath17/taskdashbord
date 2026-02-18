import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = '__td_admin';
const ADMIN_MAX_AGE = 4 * 60 * 60; // 4 hours

function getAdminPassword(): string {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }
  return pass;
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function verifyAdminRequest(request: NextRequest): boolean {
  const fromCookie = request.cookies.get(ADMIN_COOKIE)?.value;
  return fromCookie === 'authenticated';
}

export function setAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_MAX_AGE,
    path: '/',
  });
  return response;
}

export function clearAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

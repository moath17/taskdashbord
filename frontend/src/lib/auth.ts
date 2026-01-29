import { NextRequest } from 'next/server';
import { AuthUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET || '***REMOVED***';

// Simple base64 encoding for JWT-like tokens (works in Edge runtime)
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function base64Decode(str: string): string {
  return Buffer.from(str, 'base64url').toString();
}

// Simple hash function for passwords (for demo - use bcrypt in production with Node runtime)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

export function generateToken(
  userId: string, 
  email: string, 
  role: string, 
  organizationId: string,
  name: string
): string {
  const payload = {
    userId,
    email,
    role,
    organizationId,
    name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = JSON.stringify(payload);
  const signature = base64Encode(payloadStr + JWT_SECRET);
  return `${base64Encode(payloadStr)}.${signature}`;
}

export function verifyToken(token: string): { 
  userId: string; 
  email: string; 
  role: string; 
  organizationId: string;
  name: string;
} | null {
  try {
    const [payloadB64, signatureB64] = token.split('.');
    if (!payloadB64 || !signatureB64) return null;
    
    const payloadStr = base64Decode(payloadB64);
    const expectedSignature = base64Encode(payloadStr + JWT_SECRET);
    
    if (signatureB64 !== expectedSignature) return null;
    
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  if (!decoded) return null;
  
  return {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role as 'owner' | 'manager' | 'employee',
    organizationId: decoded.organizationId,
  };
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function requireRole(request: NextRequest, ...allowedRoles: string[]): AuthUser {
  const user = requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

export function requireOwnerOrManager(request: NextRequest): AuthUser {
  return requireRole(request, 'owner', 'manager');
}

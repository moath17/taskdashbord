import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, hashPassword, jsonResponse, errorResponse } from '@/lib/auth';

// GET - Get all team members
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data: members, error } = await supabase
      .from('users')
      .select('id, email, name, role, last_activity, created_at')
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get team error:', error);
      return errorResponse('Failed to get team members', 500);
    }

    // Transform to camelCase
    const transformedMembers = members?.map(m => ({
      id: m.id,
      email: m.email,
      name: m.name,
      role: m.role,
      lastActivity: m.last_activity,
      createdAt: m.created_at,
    })) || [];

    return jsonResponse({ members: transformedMembers });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Get team error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Add new team member
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Only Owner and Manager can add members
    if (!['owner', 'manager'].includes(user.role)) {
      return errorResponse('Only owners and managers can add team members', 403);
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return errorResponse('All fields are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    if (!['manager', 'employee'].includes(role)) {
      return errorResponse('Invalid role. Must be manager or employee', 400);
    }

    // Check if email already exists in this organization
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('organization_id', user.organizationId);

    if (existing && existing.length > 0) {
      return errorResponse('Email already exists in this organization', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: newMember, error } = await supabase
      .from('users')
      .insert({
        organization_id: user.organizationId,
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('Create member error:', error);
      return errorResponse('Failed to create team member', 500);
    }

    return jsonResponse({
      member: {
        id: newMember.id,
        email: newMember.email,
        name: newMember.name,
        role: newMember.role,
        createdAt: newMember.created_at,
      },
    }, 201);

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Create member error:', error);
    return errorResponse('Internal server error', 500);
  }
}

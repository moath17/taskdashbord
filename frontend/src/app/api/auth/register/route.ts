import { NextRequest } from 'next/server';
import { supabase, toCamelCase, toSnakeCase } from '@/lib/supabase';
import { hashPassword, createToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationName, name, email, password } = body;

    // Validation
    if (!organizationName || !name || !email || !password) {
      return errorResponse('All fields are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Check if email already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (existingUsers && existingUsers.length > 0) {
      return errorResponse('Email already registered', 400);
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: organizationName })
      .select()
      .single();

    if (orgError) {
      console.error('Create org error:', orgError);
      return errorResponse('Failed to create organization', 500);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create owner user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        organization_id: org.id,
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'owner',
      })
      .select()
      .single();

    if (userError) {
      // Rollback: delete organization
      await supabase.from('organizations').delete().eq('id', org.id);
      console.error('Create user error:', userError);
      return errorResponse('Failed to create user', 500);
    }

    // Create token
    const userForToken = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: org.id,
      organizationName: org.name,
    };

    const token = await createToken(userForToken);

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org.id,
        organizationName: org.name,
      },
      token,
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, createToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user with organization
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Login query error:', error);
      return errorResponse('Internal server error', 500);
    }

    if (!users || users.length === 0) {
      return errorResponse('Invalid email or password', 401);
    }

    const user = users[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Update last activity
    await supabase
      .from('users')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', user.id);

    // Create token
    const userForToken = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organization_id,
      organizationName: user.organizations?.name,
    };

    const token = await createToken(userForToken);

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organizations?.name,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Find user
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Forgot password query error:', error);
      return errorResponse('Internal server error', 500);
    }

    // Always return success (don't reveal if email exists or not)
    if (!users || users.length === 0) {
      return jsonResponse({
        message: 'If this email exists, a reset link has been sent.',
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Save token to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Token save error:', updateError);
      return errorResponse('Internal server error', 500);
    }

    // Send reset email
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: 'Task Dashboard <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset Your Password | إعادة تعيين كلمة المرور',
        html: `
          <!DOCTYPE html>
          <html dir="auto">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Task Dashboard</h1>
                <p style="color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px;">لوحة المهام</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 32px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">Hello ${user.name},</h2>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                  We received a request to reset your password. Click the button below to create a new password.
                </p>
                
                <!-- Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" 
                     style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; 
                            padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;
                            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                    Reset Password | إعادة تعيين
                  </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
                  This link will expire in <strong>1 hour</strong>.<br>
                  هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                  If you didn't request this, please ignore this email.<br>
                  إذا لم تطلب هذا، يرجى تجاهل هذا البريد.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} Task Dashboard. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return errorResponse('Failed to send reset email', 500);
    }

    return jsonResponse({
      message: 'If this email exists, a reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * Email sending - supports Resend API
 * Set RESEND_API_KEY in .env to enable automatic invite emails
 * If not set, the invite link is returned in the API response for manual sharing
 */

export async function sendInviteEmail(
  to: string,
  name: string,
  setupLink: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Task Dashboard <onboarding@resend.dev>',
        to: [to],
        subject: 'Set up your password - Task Dashboard',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Task Dashboard</h2>
            <p>Hi ${name},</p>
            <p>You have been invited to join. Please set your password to access the system.</p>
            <p><a href="${setupLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Set your password</a></p>
            <p>This link expires in 7 days. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function sendResetPasswordEmail(
  to: string,
  resetLink: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Task Dashboard <onboarding@resend.dev>',
        to: [to],
        subject: 'Reset your password - Task Dashboard',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset your password</h2>
            <p>You requested to reset your password. Click the button below to set a new password.</p>
            <p><a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

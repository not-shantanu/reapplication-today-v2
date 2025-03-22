import { Resend } from 'resend';

const resend = new Resend('re_Q5Sox36V_8YzXXmrwRzhvhHWnYqeM5xpQ');

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetLink = `${window.location.origin}/auth/reset-password?token=${resetToken}`;
    
    const { data, error } = await resend.emails.send({
      from: 'Flashjobs <noreply@shantanukhoraskar.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a56db;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The Flashjobs Team</p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
} 
import { createPasswordResetOtp } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let otp = null;
    try {
      otp = await createPasswordResetOtp(email);
    } catch (e) {
      if (e?.message !== 'Please wait before requesting another OTP') {
        throw e;
      }
    }

    if (otp) {
      const emailContent = {
        to: email,
        subject: 'Your TaskMaster Password Reset Code',
        text: `Your password reset code is: ${otp}. This code expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Code</h2>
            <p>Use the code below to reset your password. This code expires in <strong>10 minutes</strong>.</p>
            <div style="margin: 24px 0; padding: 16px; background: #f1f5f9; border-radius: 10px; font-size: 28px; letter-spacing: 6px; text-align: center; font-weight: 700;">${otp}</div>
            <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">TaskMaster - Manage your work efficiently & beautifully.</p>
          </div>
        `
      };

      await sendEmail(emailContent);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      message: 'If an account exists for this email, you will receive an OTP shortly.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

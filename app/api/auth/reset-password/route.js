import { resetPasswordWithOtp } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedOtp = typeof otp === 'string' ? otp.replace(/\D/g, '').slice(0, 6) : '';

    if (!normalizedEmail || !normalizedOtp || !password) {
      return NextResponse.json({ error: 'Email, OTP and new password are required' }, { status: 400 });
    }

    await resetPasswordWithOtp(normalizedEmail, normalizedOtp, password);

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 400 });
  }
}

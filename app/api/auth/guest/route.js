import { createUser, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST() {
  try {
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const guestEmail = `guest_${uniqueId}@example.com`;
    const defaultPassword = '12345678';
    
    const user = await createUser({
      email: guestEmail,
      password: defaultPassword,
      name: 'Guest User',
      isGuest: true
    });

    const session = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: user.isGuest
      }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: 'Failed to create guest session' }, { status: 500 });
  }
}

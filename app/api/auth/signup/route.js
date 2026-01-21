import { createUser, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await createUser({ email, password, name });
    const session = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
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
    console.error('Signup error:', error);
    const status = error.message === 'Email already exists' ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status });
  }
}

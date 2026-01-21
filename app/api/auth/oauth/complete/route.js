import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { createOAuthUser, createSession, getUserByEmail } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { access_token } = await request.json();
    if (!access_token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const supaUser = data?.user;
    const email = supaUser?.email;
    if (!email) {
      return NextResponse.json({ error: 'OAuth user has no email' }, { status: 400 });
    }

    const name =
      supaUser?.user_metadata?.full_name ||
      supaUser?.user_metadata?.name ||
      supaUser?.identities?.[0]?.identity_data?.full_name ||
      null;

    let user = await getUserByEmail(email);
    if (!user) {
      user = await createOAuthUser({ email, name });
    }

    const session = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


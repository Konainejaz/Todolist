import { getSession, updateUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const updates = await request.json();
    const userId = session.userId;

    const updatedUser = await updateUser(userId, updates);

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isGuest: updatedUser.isGuest
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

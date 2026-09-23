// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/cookies';

export async function POST() {
  try {
    await clearTokenCookie();
    
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
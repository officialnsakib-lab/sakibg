// lib/cookies.ts
import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'wahisnova_token';
const USER_COOKIE_NAME = 'wahisnova_user';

// Set token cookie (HttpOnly)
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Get token from cookie
export async function getTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value || null;
}

// Clear token cookie
export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}

// Set user cookie (non-httpOnly for client access)
export async function setUserCookie(user: any) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}
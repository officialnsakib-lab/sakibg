// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user from cookie (server-side)
export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('wahisnova_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    console.error('Get user from cookie error:', error);
    return null;
  }
}

// Check admin
export async function isAdminUser(): Promise<boolean> {
  const user = await getUserFromCookie();
  return user?.role === 'admin';
}

// Check vendor
export async function isVendorUser(): Promise<boolean> {
  const user = await getUserFromCookie();
  return user?.role === 'vendor';
}
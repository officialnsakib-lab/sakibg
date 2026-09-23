// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('wahisnova_token')?.value;
  
  let user = null;
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch (error) {
      // Invalid token
    }
  }
  
  // Admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!user || user.role !== 'admin') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }
  
  // Vendor routes
  if (pathname.startsWith('/vendor') || pathname.startsWith('/api/products/upload')) {
    if (!user || user.role !== 'vendor') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }
  
  // Auth routes
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      if (user.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (user.role === 'vendor') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/api/admin/:path*',
    '/api/products/upload',
    '/api/products/my-products',
    '/api/orders/:path*',
    '/api/withdrawal/:path*',
    '/api/reviews/:path*',
    '/login',
    '/register',
    '/profile',
    '/orders',
    '/checkout/:path*',
  ],
};
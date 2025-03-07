import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This middleware protects routes and API endpoints that require authentication
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path.startsWith('/api/auth') || 
                       path === '/';
  
  // Get the token using next-auth
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // For API routes, return 401 instead of redirecting
  const isApiPath = path.startsWith('/api/') && !path.startsWith('/api/auth');
  
  if (!token) {
    // If no token and trying to access protected API, return 401
    if (isApiPath) {
      // When we receive this response on the client, we should redirect to login
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          redirectTo: '/login?callbackUrl=' + encodeURIComponent(request.nextUrl.pathname) 
        }, 
        { status: 401 }
      );
    }
    
    // If no token and trying to access protected page, redirect to login
    if (!isPublicPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If token exists and user is on login page, redirect to home
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Protect all routes under /api except /api/auth
    '/api/:path*',
    // Protect other pages
    '/game/:path*',
    '/profile/:path*',
    '/login'
  ],
};
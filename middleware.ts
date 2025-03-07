import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define which routes require authentication
const protectedRoutes = [
  '/game',  // Game routes
  '/profile', // User profile routes
];

// Define which routes are public when authenticated
const authRoutes = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path matches any protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the path matches any auth routes (login, register)
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get the session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login from protected pages
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    // Add the original path as a query parameter to redirect back after login
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on the defined routes
  matcher: [...protectedRoutes, ...authRoutes],
};
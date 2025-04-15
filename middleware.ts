import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token; // Get the authentication token

    // Redirect authenticated users away from auth pages
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes (no token needed)
        const publicRoutes = [
          '/',
          '/api/auth',
          '/login',
          '/register',
          '/api/posts',
          '/about',
          /\.(png|jpg|jpeg|svg)$/, // Allow image files
        ];

        // Allow access to public routes regardless of authentication
        if (publicRoutes.some(route => {
          if (typeof route === 'string') return pathname.startsWith(route);
          return route.test(pathname);
        })) {
          return true;
        }

        // Protected routes require a token
        return !!token;
      },
    },
    pages: {
      signIn: '/login', // Custom sign-in page
      error: '/auth/error', // Error page
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-production'
);

export async function middleware(req: NextRequest) {
  // First, handle internationalization
  const res = intlMiddleware(req);

  // Then, handle authentication and authorization for protected routes
  const path = req.nextUrl.pathname;

  // Extract locale from path
  const pathSegments = path.split('/');
  const locale = routing.locales.includes(pathSegments[1] as any) ? pathSegments[1] : null;
  const pathWithoutLocale = locale ? path.replace(`/${locale}`, '') : path;

  const isAdminRoute = pathWithoutLocale.startsWith('/admin') && pathWithoutLocale !== '/admin/login';
  const isProtectedRoute = pathWithoutLocale.startsWith('/orders') || 
                           pathWithoutLocale.startsWith('/settings') || 
                           pathWithoutLocale.startsWith('/buy-sell');

  if (isAdminRoute || isProtectedRoute) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      const loginUrl = new URL(`/${locale || routing.defaultLocale}${isAdminRoute ? '/admin/login' : '/login'}`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // Admin route protection
      if (isAdminRoute && payload.role !== 'ADMIN') {
        const homeUrl = new URL(`/${locale || routing.defaultLocale}`, req.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      // Token is invalid or expired
      const loginUrl = new URL(`/${locale || routing.defaultLocale}${isAdminRoute ? '/admin/login' : '/login'}`, req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  return res;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*']
};

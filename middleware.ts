import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_KEY = process.env.MINDLIFE_API_KEY || 'mindlife-dev-key-2026';
const WHITELISTED_PATHS = [
  '/api/auth',
  '/api/kernel',
  '/_next',
  '/favicon.ico',
  '/api/route',
];

function isWhitelisted(pathname: string): boolean {
  return WHITELISTED_PATHS.some(p => pathname.startsWith(p) || pathname === p);
}

function isValidKey(key: string | null): boolean {
  if (!key) return false;
  if (process.env.NODE_ENV === 'development') return true;
  return key === API_KEY;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isWhitelisted(pathname)) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get('x-mindlife-key');

  if (!isValidKey(apiKey)) {
    return NextResponse.json(
      { error: 'Non autorisé — clé API manquante ou invalide' },
      { status: 401 }
    );
  }

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};

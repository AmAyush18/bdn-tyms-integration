import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = ['http://localhost:5173', 'https://breezedunord.vercel.app', 'https://www.breezedunord.mu', 'https://shop.breezedunord.mu', 'https://bdn-tyms-integration.vercel.app'];

export function middleware(request: NextRequest) {
  const tymsToken = request.cookies.get('tyms_access_token')
  const response = handleAuth(request, tymsToken)

  // Handle CORS
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    // Add CORS headers to the response
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

function handleAuth(request: NextRequest, tymsToken: { value: string } | undefined) {
  if (!tymsToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (tymsToken && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/api/:path*'],
}
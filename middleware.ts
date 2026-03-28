import { NextRequest, NextResponse } from 'next/server'

// Admin route protection: check is_admin via customer session
// Phase 1: simple check on cookie — production should verify JWT via Supabase

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes are gated — in production, verify the Supabase session here
  if (pathname.startsWith('/admin')) {
    // Phase 1: allow through; add proper session check before going live
    // TODO: verify customer.is_admin = true from Supabase JWT
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

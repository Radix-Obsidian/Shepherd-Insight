import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_DISABLE_AUTH } from './lib/env'

export async function middleware(request: NextRequest) {
  // Skip auth check if disabled (DEV ONLY)
  if (NEXT_PUBLIC_DISABLE_AUTH) {
    return NextResponse.next()
  }
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Array.from(request.cookies.getAll()).map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes - The Shepherd Journey + Legacy
  const protectedRoutes = [
    // New Shepherd Journey
    '/compass', '/muse', '/blueprint',
    // Legacy (to be deprecated)
    '/intake', '/insight', '/vault', '/mindmap', '/exports', 
    // Dashboard
    '/dashboard'
  ]
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // New Shepherd Journey
    '/compass', '/muse', '/blueprint',
    // Legacy
    '/intake', '/insight', '/vault', '/mindmap', '/exports', 
    // Dashboard
    '/dashboard'
  ]
}

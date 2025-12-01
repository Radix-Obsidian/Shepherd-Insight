import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_DISABLE_AUTH } from './lib/env'

export async function middleware(request: NextRequest) {
  // Skip auth check if disabled (DEV ONLY)
  if (NEXT_PUBLIC_DISABLE_AUTH) {
    return NextResponse.next()
  }

  // Skip auth if Supabase is not configured
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Update request cookies for downstream
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            // Create new response with updated request
            response = NextResponse.next({
              request,
            })
            // Set cookies on response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Use getUser() instead of getSession() - it validates with Supabase server
    // This also refreshes the session if needed and updates cookies
    const { data: { user }, error } = await supabase.auth.getUser()

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

    if (isProtectedRoute && (!user || error)) {
      const redirectUrl = new URL('/account', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch {
    // If session check fails, allow the request to proceed
    // The page-level auth checks will handle it
    return NextResponse.next()
  }
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

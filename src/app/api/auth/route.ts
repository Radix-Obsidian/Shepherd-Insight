import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/env'
import { logger } from '@/lib/logger'

type AuthAction = 'signup' | 'signin' | 'signout' | 'session'

interface AuthRequestBody {
  action?: AuthAction
  email?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    const body = (await request.json()) as AuthRequestBody
    const { action, email, password } = body

    switch (action) {
      case 'signup': {
        if (!email || !password) {
          return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        return NextResponse.json({
          user: authData.user,
          session: authData.session
        })
      }

      case 'signin': {
        if (!email || !password) {
          return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }

        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        return NextResponse.json({
          user: authData.user,
          session: authData.session
        })
      }

      case 'signout': {
        const { error } = await supabase.auth.signOut()

        if (error) throw error

        return NextResponse.json({ success: true })
      }

      case 'session': {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        return NextResponse.json({ session })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: unknown) {
    logger.error('Auth error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'session': {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        return NextResponse.json({ session })
      }

      case 'user': {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) throw error

        return NextResponse.json({ user })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: unknown) {
    logger.error('Auth GET error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

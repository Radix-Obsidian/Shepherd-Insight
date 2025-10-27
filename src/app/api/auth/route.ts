import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/env'
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'signup': {
        const { email, password } = data
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
        const { email, password } = data
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
  } catch (error: any) {
    logger.error('Auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
  } catch (error: any) {
    logger.error('Auth GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

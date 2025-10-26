'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface User {
  id: string
  email: string
}

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string>('')

  const supabase = createSupabaseBrowserClient()

  // Check session on mount
  useEffect(() => {
    checkSession()
    
    // Set up auth state change listener for redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        })
        setFormData({ email: '', password: '', confirmPassword: '' })
        setIsLoading(false)
        // Only redirect if not already on a protected route that isn't the account page
        if (window.location.pathname !== '/dashboard' && window.location.pathname !== '/account') {
          console.log('Redirecting to dashboard...')
          router.push('/dashboard')
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        })
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setError('Unable to connect to authentication service')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (authMode === 'register' && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error

        // Don't redirect immediately - let onAuthStateChange handle it
        console.log('Login successful, waiting for auth state change...')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error

        // Don't redirect immediately - let onAuthStateChange handle it
        console.log('Registration successful, waiting for auth state change...')
      }
    } catch (error: any) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  if (user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Account</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default">Authenticated</Badge>
              <Badge variant="warning">Supabase</Badge>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Now that you're authenticated, you can create and manage projects!
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/dashboard')}>
                View Dashboard
              </Button>
              <Button onClick={() => router.push('/intake')} variant="outline">
                Create New Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Account</h1>
        <p className="text-muted-foreground">
          Sign in to access your Shepherd Insight projects.
        </p>
      </div>

      {error && error.includes('Configuration error') && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">Configuration Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <div className="space-y-2 text-sm">
              <p className="font-medium">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-400">
                <li>Go to your Supabase dashboard</li>
                <li>Copy your project URL and anon key</li>
                <li>Create/update <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env.local</code> in your project root</li>
                <li>Add your credentials (see SUPABASE_SETUP.md for details)</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-blue-600 hover:underline"
            >
              {authMode === 'login'
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

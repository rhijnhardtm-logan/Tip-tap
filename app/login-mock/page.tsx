'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Zap } from 'lucide-react'
import { loginSchema } from '@/lib/schemas'
import { mockAuth } from '@/lib/mock-auth'
import axios from 'axios'

export default function LoginMockPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate with Zod
      const validated = loginSchema.parse(formData)

      // Use mock auth
      const user = await mockAuth.login(validated.email, validated.password)
      
      if (user) {
        // Store session in localStorage
        localStorage.setItem('tiptap_user', JSON.stringify(user))
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message)
      } else if (err.errors) {
        // Zod validation errors
        setError(err.errors[0].message)
      } else {
        setError('Failed to login. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Sign In (Mock)
            </CardTitle>
            <CardDescription>
              Testing mode - No Supabase required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Using mock authentication. Data is stored locally in your browser.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/register-mock" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
              <div className="pt-3 border-t text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Have Supabase set up?
                </p>
                <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                  Use Supabase authentication
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

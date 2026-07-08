'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Wallet, Send, Plus, AlertCircle, Loader2, LogOut } from 'lucide-react'
import axios from 'axios'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

interface DashboardData {
  success: boolean
  worker: {
    id: string
    first_name: string
    last_name: string
    location: string | null
    rating: number
    total_tips_earned: number
    is_active: boolean
  }
  wallet: {
    id: string
    balance: number
    currency: string
  }
  earnings: {
    today: number
    week: number
    month: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard data from real Supabase via API
  const { data: dashboardData, isLoading: isLoadingData, error: dataError } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has a valid Supabase session
        const response = await axios.get('/api/auth/session')
        if (!response.data.success || !response.data.user) {
          router.push('/login')
          return
        }
        setIsLoading(false)
      } catch (err) {
        console.error('[Dashboard] Auth check failed:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated={true} userName="Loading..." />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (error || dataError) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated={true} userName="Error" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load dashboard</p>
              <p className="text-sm text-destructive/80">
                {error || dataError?.message || 'Please try again later'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const worker = dashboardData?.worker
  const wallet = dashboardData?.wallet
  const earnings = dashboardData?.earnings

  if (!worker || !wallet || !earnings) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated={true} userName="Loading..." />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated={true} userName={worker.first_name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {worker.first_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            {worker.location ? `📍 ${worker.location}` : 'Add your location in profile'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoadingData ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `R${(wallet.balance || 0).toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available funds</p>
            </CardContent>
          </Card>

          {/* Today's Earnings Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoadingData ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `R${(earnings.today || 0).toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">From tips today</p>
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoadingData ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `${(worker.rating || 5).toFixed(1)} ⭐`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Worker rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Record Tip */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record a Tip</CardTitle>
              <CardDescription>
                Add a tip you received from a customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/wallet" className="inline-block w-full">
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Tip
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Wallet</CardTitle>
              <CardDescription>
                View payment methods and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/wallet" className="inline-block w-full">
                <Button variant="outline" className="w-full gap-2">
                  <Wallet className="w-4 h-4" />
                  Open Wallet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
            <CardDescription>
              Your total earnings on TipTap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {isLoadingData ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `R${(earnings.week || 0).toFixed(2)}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {isLoadingData ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `R${(earnings.month || 0).toFixed(2)}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total All Time</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {isLoadingData ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `R${(worker.total_tips_earned || 0).toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </main>
  )
}

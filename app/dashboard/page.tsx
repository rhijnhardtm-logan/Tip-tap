'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Wallet, Send, Plus, AlertCircle, Loader2, Info } from 'lucide-react'
import { mockAuth, MockWorker, MockWallet } from '@/lib/mock-auth'
import Link from 'next/link'

interface DashboardState {
  worker: MockWorker | null
  wallet: MockWallet | null
  transactions: Array<{
    id: string
    amount: number
    methodType: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<DashboardState>({
    worker: null,
    wallet: null,
    transactions: [],
  })
  const [workerName, setWorkerName] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check mock auth session
        const userJson = localStorage.getItem('tiptap_user')
        if (!userJson) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userJson)

        // Get mock worker and wallet data
        const worker = await mockAuth.getWorker(user.id)
        const wallet = await mockAuth.getWallet(user.id)

        if (!worker || !wallet) {
          setError('Failed to load profile data')
          return
        }

        setWorkerName(user.name || 'Worker')
        setData({
          worker,
          wallet,
          transactions: [], // Mock transactions (not persisted in this version)
        })
      } catch (err) {
        console.error('Dashboard load failed:', err)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    try {
      localStorage.removeItem('tiptap_user')
      await mockAuth.logout()
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated workerName={workerName} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (error || !data.worker || !data.wallet) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated workerName={workerName} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              {error || 'Failed to load dashboard data'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { worker, wallet } = data

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated workerName={workerName} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mock Auth Info */}
        <div className="mb-6 flex gap-2 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Using Mock Authentication
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your data is stored locally in this browser. When you connect Supabase, data will be persisted to the database.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {workerName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            {worker.location ? `Location: ${worker.location}` : 'Add your location in profile'}
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
                R{wallet.balance.toFixed(2)}
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
                R{worker.today_earnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Today</p>
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
                {worker.rating.toFixed(1)} ⭐
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
        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
            <CardDescription>
              Your total earnings since joining TipTap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R{worker.total_earnings.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tips Received</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {Math.round(worker.total_earnings / 50) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

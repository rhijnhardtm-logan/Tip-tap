'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Wallet, Send, Plus, AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import useSWR from 'swr'

interface Worker {
  id: string
  firstName: string
  lastName: string
  location: string
  rating: number
  totalTipsEarned: number
  bio?: string
}

interface WalletData {
  id: string
  balance: number
  currency: string
}

interface Transaction {
  id: string
  amount: number
  methodType: string
  status: string
  description?: string
  createdAt: string
}

interface DashboardData {
  worker: Worker
  wallet: WalletData
  recentTransactions: Transaction[]
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [workerName, setWorkerName] = useState('')

  // Fetch dashboard data
  const { data, isLoading: isDataLoading, error: fetchError } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        if (!response.data.success) {
          router.push('/login')
        } else if (data?.worker) {
          setWorkerName(`${data.worker.firstName} ${data.worker.lastName}`)
        }
      } catch (err) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, data])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading || isDataLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated workerName={workerName} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (fetchError || error) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated workerName={workerName} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">Failed to load dashboard data</p>
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return null
  }

  const { worker, wallet, recentTransactions } = data

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated workerName={workerName} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {worker.firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">Location: {worker.location}</p>
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
              <p className="text-xs text-muted-foreground mt-2">{wallet.currency}</p>
            </CardContent>
          </Card>

          {/* Total Earned Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                R{worker.totalTipsEarned.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">All time</p>
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

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button size="lg" className="gap-2 justify-center" onClick={() => router.push('/wallet')}>
            <Wallet className="w-5 h-5" />
            Manage Wallet
          </Button>
          <Button size="lg" variant="outline" className="gap-2 justify-center">
            <Send className="w-5 h-5" />
            Share Payment Link
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tips</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Tip
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your payment link to receive your first tip
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        R{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.description || tx.methodType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium capitalize">
                        <span className={`px-2 py-1 rounded ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

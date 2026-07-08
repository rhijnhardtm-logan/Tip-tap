'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Plus, Trash2, Check, ArrowLeft } from 'lucide-react'
import { TipSelector } from '@/components/tip-selector'
import Link from 'next/link'
import axios from 'axios'
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

interface PaymentMethod {
  id: string
  type: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
  account_identifier: string
  account_name?: string
  is_default: boolean
}

interface WalletData {
  success: boolean
  balance: number
  currency: string
  payment_methods: PaymentMethod[]
}

const paymentTypeLabels: Record<string, string> = {
  revolut: 'Revolut',
  snapscan: 'SnapScan',
  zapper: 'Zapper',
  bank_transfer: 'Bank Transfer',
}

const paymentTypeDescriptions: Record<string, string> = {
  revolut: 'International mobile banking app',
  snapscan: 'South African QR code payment',
  zapper: 'South African instant payment',
  bank_transfer: 'Direct bank transfer',
}

export default function WalletPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    type: 'snapscan' as const,
    account_identifier: '',
    account_name: '',
    is_default: false,
  })

  // Fetch wallet data from Supabase
  const { data: walletData, isLoading: isLoadingData, error: dataError, mutate } = useSWR<WalletData>(
    '/api/wallets',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        if (!response.data.success || !response.data.user) {
          router.push('/login')
          return
        }
        setIsLoading(false)
      } catch (err) {
        console.error('[Wallet] Auth check failed:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/wallets/payment-methods', {
        type: formData.type,
        account_identifier: formData.account_identifier,
        account_name: formData.account_name || undefined,
        is_default: formData.is_default,
      })

      if (response.data.success) {
        setSuccessMessage('Payment method added successfully!')
        setFormData({
          type: 'snapscan',
          account_identifier: '',
          account_name: '',
          is_default: false,
        })
        setShowAddForm(false)
        // Refresh wallet data
        mutate()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add payment method')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      const response = await axios.delete(`/api/wallets/payment-methods/${methodId}`)

      if (response.data.success) {
        setSuccessMessage('Payment method deleted successfully!')
        mutate()
        
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete payment method')
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

  const balance = walletData?.balance || 0
  const paymentMethods = walletData?.payment_methods || []

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated={true} userName="Wallet" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Wallet Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your payment methods and track your earnings
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex gap-2 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-foreground">{successMessage}</p>
          </div>
        )}

        {/* Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>
              Total available in your TipTap wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {isLoadingData ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                `R${balance.toFixed(2)}`
              )}
            </div>
            <p className="text-muted-foreground mt-2">ZAR (South African Rand)</p>
          </CardContent>
        </Card>

        {/* Payment Methods Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Payment Methods</h2>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Method
            </Button>
          </div>

          {/* Add Payment Method Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Payment Method</CardTitle>
                <CardDescription>
                  Add a new payment method to receive tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Payment Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="revolut">Revolut</option>
                      <option value="snapscan">SnapScan</option>
                      <option value="zapper">Zapper</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                    <p className="text-sm text-muted-foreground">
                      {paymentTypeDescriptions[formData.type]}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_identifier">Account Identifier</Label>
                    <Input
                      id="account_identifier"
                      placeholder={
                        formData.type === 'revolut'
                          ? 'your@email.com or phone number'
                          : formData.type === 'snapscan'
                          ? 'SnapScan merchant ID'
                          : formData.type === 'zapper'
                          ? 'Cell number or email'
                          : 'Bank account number'
                      }
                      value={formData.account_identifier}
                      onChange={(e) =>
                        setFormData({ ...formData, account_identifier: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_name">Account Name (Optional)</Label>
                    <Input
                      id="account_name"
                      placeholder="Account holder name"
                      value={formData.account_name}
                      onChange={(e) =>
                        setFormData({ ...formData, account_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="is_default"
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData({ ...formData, is_default: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="is_default" className="mb-0">
                      Set as default payment method
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.account_identifier}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Payment Method'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods List */}
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No payment methods added yet. Add one to start receiving tips.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {paymentTypeLabels[method.type]}
                          </h3>
                          {method.is_default && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {method.account_identifier}
                        </p>
                        {method.account_name && (
                          <p className="text-sm text-muted-foreground">
                            {method.account_name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Record Tip Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Record a Tip</h2>
          <TipSelector />
        </div>
      </div>
    </main>
  )
}

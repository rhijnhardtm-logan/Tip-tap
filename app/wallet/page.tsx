'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Plus, Trash2, Check } from 'lucide-react'
import axios from 'axios'
import useSWR from 'swr'

interface PaymentMethod {
  id: string
  type: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
  accountIdentifier: string
  accountName?: string
  isDefault: boolean
  isActive: boolean
}

interface WalletData {
  paymentMethods: PaymentMethod[]
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const paymentTypeLabels: Record<string, string> = {
  revolut: 'Revolut',
  snapscan: 'SnapScan',
  zapper: 'Zapper',
  bank_transfer: 'Bank Transfer',
}

export default function WalletPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    type: 'snapscan' as const,
    accountIdentifier: '',
    accountName: '',
    isDefault: false,
  })

  const { data, isLoading, error: fetchError, mutate } = useSWR<WalletData>(
    '/api/wallets/payment-methods',
    fetcher
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        if (!response.data.success) {
          router.push('/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch (err) {
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
      const response = await axios.post('/api/wallets/payment-methods', formData)
      
      if (response.data.success) {
        setSuccessMessage('Payment method added successfully!')
        setFormData({
          type: 'snapscan',
          accountIdentifier: '',
          accountName: '',
          isDefault: false,
        })
        setShowAddForm(false)
        // Refresh data
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

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      await axios.delete(`/api/wallets/payment-methods/${id}`)
      mutate()
      setSuccessMessage('Payment method deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete payment method')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated={false} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated onLogout={() => router.push('/')} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Wallet Management</h1>
          <p className="text-muted-foreground mt-2">
            Add and manage your payment methods
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex gap-2 p-4 bg-green-100 border border-green-200 rounded-lg mb-6">
            <Check className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Add Payment Method Form */}
        {showAddForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Add Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Payment Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        type: e.target.value as any
                      }))}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                    >
                      <option value="snapscan">SnapScan</option>
                      <option value="revolut">Revolut</option>
                      <option value="zapper">Zapper</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name (Optional)</Label>
                    <Input
                      id="accountName"
                      placeholder="Your name"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accountName: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountIdentifier">Account Identifier</Label>
                  <Input
                    id="accountIdentifier"
                    placeholder={
                      formData.type === 'snapscan' ? 'your@email.com' :
                      formData.type === 'revolut' ? '@username or IBAN' :
                      formData.type === 'zapper' ? '+27712345678' :
                      'Bank account details'
                    }
                    value={formData.accountIdentifier}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      accountIdentifier: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isDefault: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default payment method
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
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
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Your Payment Methods</CardTitle>
              <CardDescription>
                Manage how you receive tips
              </CardDescription>
            </div>
            {!showAddForm && (
              <Button size="sm" className="gap-2" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4" />
                Add Method
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : data?.paymentMethods && data.paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {data.paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {paymentTypeLabels[method.type]}
                        </p>
                        {method.isDefault && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            Default
                          </span>
                        )}
                        {!method.isActive && (
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.accountIdentifier}
                      </p>
                      {method.accountName && (
                        <p className="text-xs text-muted-foreground">
                          {method.accountName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payment methods added yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a payment method to receive tips
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

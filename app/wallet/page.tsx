'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Plus, Trash2, Check, ArrowLeft, Info } from 'lucide-react'
import { mockAuth, MockWallet, MockWorker } from '@/lib/mock-auth'
import { TipSelector } from '@/components/tip-selector'
import Link from 'next/link'

interface PaymentMethod {
  id: string
  type: 'revolut' | 'snapscan' | 'zapper' | 'bank_transfer'
  accountIdentifier: string
  accountName?: string
  isDefault: boolean
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
  const [userId, setUserId] = useState<string | null>(null)
  const [wallet, setWallet] = useState<MockWallet | null>(null)
  const [worker, setWorker] = useState<MockWorker | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    type: 'snapscan' as const,
    accountIdentifier: '',
    accountName: '',
    isDefault: false,
  })

  // Load wallet data on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const userJson = localStorage.getItem('tiptap_user')
        if (!userJson) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userJson)
        setUserId(user.id)

        // Get wallet and worker data
        const walletData = await mockAuth.getWallet(user.id)
        const workerData = await mockAuth.getWorker(user.id)

        if (!walletData || !workerData) {
          setError('Failed to load wallet data')
          return
        }

        setWallet(walletData)
        setWorker(workerData)

        // Load payment methods from localStorage
        const stored = localStorage.getItem(`payment_methods_${user.id}`)
        if (stored) {
          setPaymentMethods(JSON.parse(stored))
        }
      } catch (err) {
        console.error('Load failed:', err)
        setError('Failed to load wallet')
      } finally {
        setIsLoading(false)
      }
    }

    loadWallet()
  }, [router])

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (!formData.accountIdentifier) {
        setError('Please enter an account identifier')
        return
      }

      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: formData.type,
        accountIdentifier: formData.accountIdentifier,
        accountName: formData.accountName || undefined,
        isDefault: formData.isDefault || paymentMethods.length === 0,
      }

      const updated = [...paymentMethods, newMethod]
      setPaymentMethods(updated)

      // Save to localStorage
      if (userId) {
        localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updated))
      }

      setSuccessMessage('Payment method added successfully!')
      setFormData({
        type: 'snapscan',
        accountIdentifier: '',
        accountName: '',
        isDefault: false,
      })
      setShowAddForm(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to add payment method')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const updated = paymentMethods.filter(pm => pm.id !== id)
      setPaymentMethods(updated)

      if (userId) {
        localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updated))
      }

      setSuccessMessage('Payment method deleted')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete payment method')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const updated = paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id,
      }))
      setPaymentMethods(updated)

      if (userId) {
        localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updated))
      }

      setSuccessMessage('Default payment method updated')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to update default method')
    }
  }

  const handleAddTip = async (amount: number, methodType: string) => {
    if (!userId || !wallet || !worker) return

    try {
      // Update wallet and worker with transaction
      await mockAuth.addTransaction(userId, amount, methodType)

      // Refresh wallet and worker data
      const updatedWallet = await mockAuth.getWallet(userId)
      const updatedWorker = await mockAuth.getWorker(userId)

      setWallet(updatedWallet)
      setWorker(updatedWorker)
      setSuccessMessage(`Tip of R${amount.toFixed(2)} recorded successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to record tip')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (!wallet || !worker) {
    return (
      <main className="min-h-screen bg-background">
        <Header authenticated />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error || 'Failed to load wallet'}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header authenticated />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Wallet & Payment Methods</h1>

        {/* Info Banner */}
        <div className="mb-6 flex gap-2 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Using mock authentication. Payment methods are stored locally in your browser.
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
          <div className="mb-6 flex gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary">{successMessage}</p>
          </div>
        )}

        {/* Wallet Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-4">
              R{wallet.balance.toFixed(2)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Today&apos;s Earnings</p>
                <p className="text-lg font-semibold mt-1">R{worker.today_earnings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Received</p>
                <p className="text-lg font-semibold mt-1">R{wallet.total_received.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tip Recording Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Record a Tip</CardTitle>
            <CardDescription>
              Quickly add tips you&apos;ve received from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TipSelector onAddTip={handleAddTip} />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Add accounts to receive your tips
              </CardDescription>
            </div>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Method
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Payment Method Form */}
            {showAddForm && (
              <form onSubmit={handleAddPaymentMethod} className="border-t pt-4 space-y-4">
                <div>
                  <Label htmlFor="type">Payment Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                  >
                    <option value="snapscan">SnapScan</option>
                    <option value="zapper">Zapper</option>
                    <option value="revolut">Revolut</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paymentTypeDescriptions[formData.type]}
                  </p>
                </div>

                <div>
                  <Label htmlFor="identifier">
                    Account Identifier
                  </Label>
                  <Input
                    id="identifier"
                    placeholder="e.g., your phone number or account number"
                    value={formData.accountIdentifier}
                    onChange={(e) =>
                      setFormData({ ...formData, accountIdentifier: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Account Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John's SnapScan"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="default"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="default" className="cursor-pointer">
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Payment Methods List */}
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No payment methods added yet. Add one to start receiving tips.
              </p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {paymentTypeLabels[method.type]}
                        </p>
                        {method.isDefault && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.accountName || method.accountIdentifier}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

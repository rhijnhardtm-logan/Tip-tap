'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

const TIP_AMOUNTS = [1, 2, 5, 10, 20]

interface TipSelectorProps {
  workerId?: string
  onSuccess?: (transactionId: string) => void
}

export function TipSelector({ workerId, onSuccess }: TipSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [methodType, setMethodType] = useState<'snapscan' | 'revolut' | 'zapper' | 'cash' | 'stripe'>('snapscan')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!finalAmount || finalAmount <= 0) {
      setError('Please select or enter a valid tip amount')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/transactions', {
        amount: finalAmount,
        methodType,
        description: description || undefined,
      })

      if (response.data.success) {
        setSuccessMessage(`Tip of R${finalAmount.toFixed(2)} recorded successfully!`)
        setSelectedAmount(null)
        setCustomAmount('')
        setDescription('')
        setMethodType('snapscan')
        
        // Call callback
        onSuccess?.(response.data.transaction.id)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record tip')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a Tip</CardTitle>
        <CardDescription>
          Choose a preset amount or enter a custom amount
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex gap-2 p-3 bg-green-100 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Preset Amounts */}
          <div>
            <Label className="mb-3 block">Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {TIP_AMOUNTS.map(amount => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount('')
                  }}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  R{amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="customAmount">Custom Amount (ZAR)</Label>
            <div className="flex gap-2">
              <span className="flex items-center text-lg font-semibold text-foreground">R</span>
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  if (e.target.value) {
                    setSelectedAmount(null)
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="methodType">Payment Method</Label>
            <select
              id="methodType"
              value={methodType}
              onChange={(e) => setMethodType(e.target.value as any)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
            >
              <option value="snapscan">SnapScan</option>
              <option value="revolut">Revolut</option>
              <option value="zapper">Zapper</option>
              <option value="cash">Cash</option>
              <option value="stripe">Stripe (Wallet)</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Great service!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Summary */}
          {finalAmount && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tip Amount:</span>
                <span className="text-2xl font-bold text-foreground">
                  R{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!finalAmount || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Send Tip'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

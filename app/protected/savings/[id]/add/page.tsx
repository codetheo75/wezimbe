'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Saving {
  id: string
  name: string
  goal_amount: number
  current_amount: number
}

export default function AddFundsPage() {
  const params = useParams()
  const router = useRouter()
  const savingsId = params.id as string
  const [saving, setSaving] = useState<Saving | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchSaving = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('id', savingsId)
        .single()

      if (error) {
        setError('Savings goal not found')
      } else if (data) {
        setSaving(data)
      }
      setIsLoading(false)
    }

    fetchSaving()
  }, [savingsId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!amount) {
      setError('Please enter an amount')
      return
    }

    const depositAmount = parseFloat(amount)
    if (depositAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    const supabase = createClient()
    setIsSubmitting(true)

    try {
      // Add transaction
      const { error: transactionError } = await supabase.from('transactions').insert([
        {
          savings_id: savingsId,
          type: 'deposit',
          amount: depositAmount,
          description: description || 'Deposit',
        },
      ])

      if (transactionError) throw transactionError

      // Update savings amount
      if (saving) {
        const newAmount = saving.current_amount + depositAmount
        const { error: updateError } = await supabase
          .from('savings')
          .update({ current_amount: newAmount })
          .eq('id', savingsId)

        if (updateError) throw updateError
      }

      router.push(`/protected/savings/${savingsId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add funds')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!saving) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Savings goal not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Add Funds</h1>
        <p className="text-slate-600 mt-1">Add funds to {saving.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Deposit</CardTitle>
          <CardDescription>Deposit money into your savings goal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Current Amount</p>
              <p className="text-3xl font-bold text-slate-900">
                ${saving.current_amount.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Goal: ${saving.goal_amount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-medium">Amount to Deposit *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-50 pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Monthly savings"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Deposit Funds'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

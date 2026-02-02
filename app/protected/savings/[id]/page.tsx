'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Saving {
  id: string
  name: string
  description: string
  goal_amount: number
  current_amount: number
  created_at: string
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  description: string
  created_at: string
}

export default function SavingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const savingsId = params.id as string
  const [saving, setSaving] = useState<Saving | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch saving
      const { data: savingData, error: savingError } = await supabase
        .from('savings')
        .select('*')
        .eq('id', savingsId)
        .single()

      if (!savingError && savingData) {
        setSaving(savingData)
      }

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('savings_id', savingsId)
        .order('created_at', { ascending: false })

      if (!transactionError && transactionData) {
        setTransactions(transactionData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [savingsId])

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

  const progress = (saving.current_amount / saving.goal_amount) * 100
  const remaining = saving.goal_amount - saving.current_amount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{saving.name}</h1>
          <p className="text-slate-600 mt-1">{saving.description}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/protected/savings">
            <Button variant="outline">Back</Button>
          </Link>
          <Link href={`/protected/savings/${saving.id}/add`}>
            <Button className="bg-green-600 hover:bg-green-700">
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Overall Progress</span>
              <span className="text-2xl font-bold text-slate-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Current Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ${saving.current_amount.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Goal Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ${saving.goal_amount.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-slate-900">
                ${remaining.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-lg ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

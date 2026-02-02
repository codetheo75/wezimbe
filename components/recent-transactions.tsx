'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  description: string
  created_at: string
  savings_id: string
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setTransactions(data)
      }
      setIsLoading(false)
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest account activity</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{transaction.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

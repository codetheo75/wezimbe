'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Saving {
  id: string
  name: string
  current_amount: number
  goal_amount: number
  user_id: string
}

export default function SavingsOverview() {
  const [savings, setSavings] = useState<Saving[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSavings = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSavings(data)
      }
      setIsLoading(false)
    }

    fetchSavings()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Savings Goals</CardTitle>
          <CardDescription>Track your individual savings</CardDescription>
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
        <CardTitle>Personal Savings Goals</CardTitle>
        <CardDescription>Track your individual savings and progress</CardDescription>
      </CardHeader>
      <CardContent>
        {savings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No savings goals yet</p>
            <p className="text-sm text-slate-400">Create your first savings goal to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savings.map((saving) => {
              const progress = (saving.current_amount / saving.goal_amount) * 100
              return (
                <div key={saving.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{saving.name}</h3>
                    <span className="text-sm text-slate-600">
                      ${saving.current_amount.toFixed(2)} / ${saving.goal_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Saving {
  id: string
  name: string
  description: string
  current_amount: number
  goal_amount: number
  created_at: string
}

export default function SavingsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Savings Goals</h1>
          <p className="text-slate-600 mt-1">Manage your personal savings goals</p>
        </div>
        <Link href="/protected/savings/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + New Goal
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading savings goals...</p>
        </div>
      ) : savings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No savings goals yet</p>
              <Link href="/protected/savings/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Goal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savings.map((saving) => {
            const progress = (saving.current_amount / saving.goal_amount) * 100
            return (
              <Card key={saving.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{saving.name}</CardTitle>
                  <CardDescription>{saving.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Progress</span>
                      <span className="text-sm font-bold text-slate-900">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">
                      ${saving.current_amount.toFixed(2)} / ${saving.goal_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Remaining: ${(saving.goal_amount - saving.current_amount).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href={`/protected/savings/${saving.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/protected/savings/${saving.id}/add`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Add Funds
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

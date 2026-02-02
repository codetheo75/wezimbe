'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SavingsOverview from '@/components/savings-overview'
import RecentTransactions from '@/components/recent-transactions'

interface UserData {
  id: string
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
        })
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back!</h1>
        <p className="text-slate-600">{user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Group Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">In active groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500 mt-1">Groups you&apos;re part of</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your savings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/protected/savings/new" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Savings Goal
                </Button>
              </Link>
              <Link href="/protected/groups/new" className="block">
                <Button variant="outline" className="w-full">
                  Create Group
                </Button>
              </Link>
              <Link href="/protected/groups/join" className="block">
                <Button variant="outline" className="w-full">
                  Join Group
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-3">
              <p>💡 Set up multiple savings goals to track different objectives</p>
              <p>👥 Create groups with friends for collaborative saving</p>
              <p>📊 Monitor your progress with detailed transaction history</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <SavingsOverview />
    </div>
  )
}

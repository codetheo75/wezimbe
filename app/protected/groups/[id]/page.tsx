'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string
  goal_amount: number
  current_amount: number
  created_at: string
}

interface GroupTransaction {
  id: string
  user_id: string
  amount: number
  description: string
  created_at: string
}

interface GroupMember {
  id: string
  user_id: string
  joined_at: string
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const [group, setGroup] = useState<Group | null>(null)
  const [transactions, setTransactions] = useState<GroupTransaction[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (!groupError && groupData) {
        setGroup(groupData)
      }

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('group_transactions')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!transactionError && transactionData) {
        setTransactions(transactionData)
      }

      // Fetch members
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)

      if (!memberError && memberData) {
        setMembers(memberData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [groupId])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Group not found</p>
      </div>
    )
  }

  const progress = (group.current_amount / group.goal_amount) * 100
  const remaining = group.goal_amount - group.current_amount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
          <p className="text-slate-600 mt-1">{group.description}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/protected/groups">
            <Button variant="outline">Back</Button>
          </Link>
          <Link href={`/protected/groups/${group.id}/contribute`}>
            <Button className="bg-green-600 hover:bg-green-700">
              Contribute
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Total Saved</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${group.current_amount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Goal Amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${group.goal_amount.toFixed(2)}
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
              <CardTitle>Recent Contributions</CardTitle>
              <CardDescription>Latest group transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No contributions yet</p>
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
                      <span className="font-semibold text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {member.user_id.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-600 flex-1 ml-2">
                      {member.user_id.substring(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

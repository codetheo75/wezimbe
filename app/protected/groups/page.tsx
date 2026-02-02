'use client'

import { useEffect, useState } from 'react'
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
  created_by: string
  created_at: string
}

interface GroupMember {
  group_id: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (memberError) {
        console.error('Error fetching groups:', memberError)
        setIsLoading(false)
        return
      }

      // Get the actual group details
      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => (m as GroupMember).group_id)
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('created_at', { ascending: false })

        if (!groupsError && groupsData) {
          setGroups(groupsData)
        }
      }

      setIsLoading(false)
    }

    fetchGroups()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Groups</h1>
          <p className="text-slate-600 mt-1">Join or create groups to save together</p>
        </div>
        <div className="flex gap-3">
          <Link href="/protected/groups/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Create Group
            </Button>
          </Link>
          <Link href="/protected/groups/join">
            <Button variant="outline">
              Join Existing
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">You haven&apos;t joined any groups yet</p>
              <div className="flex gap-3 justify-center">
                <Link href="/protected/groups/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create a Group
                  </Button>
                </Link>
                <Link href="/protected/groups/join">
                  <Button variant="outline">
                    Join a Group
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const progress = (group.current_amount / group.goal_amount) * 100
            return (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
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
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">
                      ${group.current_amount.toFixed(2)} / ${group.goal_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Remaining: ${(group.goal_amount - group.current_amount).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href={`/protected/groups/${group.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/protected/groups/${group.id}/contribute`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Contribute
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

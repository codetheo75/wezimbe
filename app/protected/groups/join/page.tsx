'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
  description: string
  goal_amount: number
  current_amount: number
  created_by: string
}

interface GroupMember {
  group_id: string
}

export default function JoinGroupPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [userGroups, setUserGroups] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Get all groups
      const { data: allGroups } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

      // Get groups the user is already a member of
      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      const memberGroupIds = memberData?.map(m => (m as GroupMember).group_id) || []

      if (allGroups) {
        setGroups(allGroups)
        setUserGroups(memberGroupIds)
      }

      setIsLoading(false)
    }

    fetchGroups()
  }, [])

  const handleJoin = async (groupId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setJoiningId(groupId)

    try {
      const { error } = await supabase.from('group_members').insert([
        {
          group_id: groupId,
          user_id: user.id,
        },
      ])

      if (error) throw error

      router.push('/protected/groups')
    } catch (err) {
      console.error('Error joining group:', err)
      setJoiningId(null)
    }
  }

  const filteredGroups = groups.filter(
    (group) =>
      !userGroups.includes(group.id) &&
      (group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Join a Group</h1>
        <p className="text-slate-600 mt-1">Find and join existing savings groups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Groups</CardTitle>
          <CardDescription>Find groups to join</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600">
                {userGroups.length === groups.length
                  ? "You're already a member of all available groups!"
                  : searchTerm
                    ? 'No groups match your search'
                    : 'No groups available to join'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredGroups.map((group) => {
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

                  <p className="text-sm text-slate-600">
                    ${group.current_amount.toFixed(2)} / ${group.goal_amount.toFixed(2)}
                  </p>

                  <Button
                    onClick={() => handleJoin(group.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={joiningId === group.id}
                  >
                    {joiningId === group.id ? 'Joining...' : 'Join Group'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

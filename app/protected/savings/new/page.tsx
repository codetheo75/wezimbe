'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function NewSavingsPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !goalAmount) {
      setError('Please fill in all required fields')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('savings').insert([
        {
          user_id: user.id,
          name,
          description,
          goal_amount: parseFloat(goalAmount),
          current_amount: 0,
        },
      ])

      if (insertError) throw insertError
      router.push('/protected/savings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create savings goal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Create New Savings Goal</h1>
        <p className="text-slate-600 mt-1">Start tracking a new savings objective</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Savings Goal</CardTitle>
          <CardDescription>Fill in the details for your savings goal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Goal Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Vacation, New Laptop, Emergency Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <Input
                id="description"
                placeholder="What is this goal for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalAmount" className="text-base font-medium">Goal Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000.00"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="bg-slate-50 pl-7"
                />
              </div>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

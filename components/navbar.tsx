'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/protected" className="text-2xl font-bold text-blue-600">
          Wezimbe
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/protected" className="text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/protected/savings" className="text-slate-600 hover:text-slate-900">
            My Savings
          </Link>
          <Link href="/protected/groups" className="text-slate-600 hover:text-slate-900">
            Groups
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/protected/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

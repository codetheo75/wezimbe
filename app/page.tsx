'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        router.push('/protected')
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-2xl text-center">
          <h1 className="text-6xl font-bold text-white mb-6">Wezimbe</h1>
          <p className="text-2xl text-blue-100 mb-8">Group Savings Made Simple</p>
          <p className="text-lg text-blue-50 mb-12 leading-relaxed">
            Save together with friends and family. Create personal savings goals and collaborative group savings accounts. Track progress, manage contributions, and achieve your financial goals together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Personal Goals</h3>
              <p className="text-blue-100">Create and track your individual savings goals with ease</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Group Savings</h3>
              <p className="text-blue-100">Collaborate with friends and family on shared savings</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-blue-100">Monitor all transactions and watch your goals come true</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Wezimbe</h1>
            <p className="text-slate-400">Group Savings Made Simple</p>
          </div>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong during authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded">
                <p className="text-sm">
                  We encountered an error processing your request. Please try again.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

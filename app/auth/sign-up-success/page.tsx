import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignUpSuccessPage() {
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
              <CardTitle className="text-white">Verify Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent you a confirmation email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 text-green-200 px-4 py-3 rounded">
                <p className="text-sm">
                  Check your email to confirm your account. Once confirmed, you can sign in.
                </p>
              </div>
              <p className="text-sm text-slate-400 text-center">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// app/signup/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-600">
            Join D-Rush Lodge to book your next stay
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
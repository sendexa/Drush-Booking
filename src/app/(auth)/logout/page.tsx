// app/logout/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()

        if (error) {
          toast.error('Logout failed', {
            description: error.message
          })
          return
        }

        toast.success('You have been logged out successfully')
        router.push('/login')
        router.refresh() // Refresh the router to update auth state
      } catch {
        toast.error('An unexpected error occurred during logout')
      }
    }

    handleLogout()
  }, [router, supabase.auth])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-lg">Logging out...</p>
    </div>
  )
}
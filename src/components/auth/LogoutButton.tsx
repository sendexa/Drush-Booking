// components/auth/LogoutButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

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

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}
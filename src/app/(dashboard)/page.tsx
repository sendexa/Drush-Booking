// app/page.tsx
import { getCurrentUser } from '@/utils/supabase/auth'
import { getBookingStats, getRecentBookings } from '@/utils/supabase/db'
import DashboardStats from '@/components/home/DashboardStats'
import RecentBookings from '@/components/home/RecentBookings'
import QuickActions from '@/components/home/QuickActions'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const stats = await getBookingStats(user.id)
  const recentBookings = await getRecentBookings(user.id)

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">
          Welcome back, {user.full_name || 'Guest'}
        </h1>
        
        <DashboardStats stats={stats} />
        <QuickActions />
        <RecentBookings bookings={recentBookings} />
      </main>
    </div>
  )
}
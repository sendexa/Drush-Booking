// app/page.tsx
import { getCurrentUser } from '@/utils/supabase/auth'
import { getBookingStats, getRecentBookings } from '@/utils/supabase/db'
import DashboardStats from '@/components/home/DashboardStats'
import RecentBookings from '@/components/home/RecentBookings'
import QuickActions from '@/components/home/QuickActions'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
//import { useState } from 'react'

export default async function Dashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const stats = await getBookingStats(user.id)
  const recentBookings = await getRecentBookings(user.id)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.full_name || 'Guest'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your bookings today.
        </p>
      </div>

      {/* Stats and Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardStats stats={stats} />
          <QuickActions />
          <RecentBookings bookings={recentBookings} />
        </div>

        {/* Calendar Widget */}
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Upcoming Stays Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Upcoming Stays</h3>
              {recentBookings.filter(booking => 
                new Date(booking.check_in_date) > new Date()
              ).length > 0 ? (
                <div className="space-y-4">
                  {recentBookings
                    .filter(booking => new Date(booking.check_in_date) > new Date())
                    .slice(0, 3)
                    .map(booking => (
                      <div key={booking.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.room_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.check_in_date), 'MMM d')} -{' '}
                            {format(new Date(booking.check_out_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No upcoming stays scheduled
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
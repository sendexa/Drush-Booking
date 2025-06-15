// utils/supabase/db.ts
import { createClient } from './server'

export async function getBookingStats(userId: string) {
  const supabase = await createClient()

  const [
    { count: totalBookings },
    { count: upcomingBookings },
    { count: cancelledBookings }
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('check_in_date', new Date().toISOString())
      .eq('status', 'confirmed'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'cancelled')
  ])

  return {
    totalBookings,
    upcomingBookings,
    cancelledBookings
  }
}

export async function getRecentBookings(userId: string, limit = 5) {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return bookings || []
}
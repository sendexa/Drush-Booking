// utils/supabase/db.ts
import { createClient } from './client'

export async function getBookingStats(userId: string) {
  const supabase = await createClient()

  // Get total bookings
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get upcoming bookings
  const { count: upcomingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('check_in_date', new Date().toISOString())
    .neq('status', 'cancelled')

  // Get cancelled bookings
  const { count: cancelledBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'cancelled')

  // Get total spent
  const { data: totalSpentData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('user_id', userId)
    .neq('status', 'cancelled')

  const totalSpent = totalSpentData?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

  return {
    totalBookings,
    upcomingBookings,
    cancelledBookings,
    totalSpent
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
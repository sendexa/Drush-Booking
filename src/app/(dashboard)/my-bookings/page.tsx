// app/bookings/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingCard from '@/components/booking/BookingCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's bookings with room images
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      user_id,
      room_id,
      room_type,
      check_in_date,
      check_out_date,
      guests,
      total_price,
      status,
      special_requests,
      created_at,
      updated_at,
      rooms:room_id (image_urls)
    `)
    .eq('user_id', user.id)
    .order('check_in_date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    // You might want to show an error message to the user here
  }

  // Separate upcoming and past bookings
  const now = new Date().toISOString()
  const upcomingBookings = bookings?.filter(
    booking => new Date(booking.check_out_date) >= new Date(now)
  ) || []
  const pastBookings = bookings?.filter(
    booking => new Date(booking.check_out_date) < new Date(now)
  ) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Button asChild>
          <Link href="/book">Book New Room</Link>
        </Button>
      </div>

      <div className="space-y-12">
        {/* Upcoming Bookings */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Stays</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={{
                    ...booking,
                    rooms: Array.isArray(booking.rooms) 
                      ? (booking.rooms[0] 
                        ? { image_urls: booking.rooms[0].image_urls as string[] } 
                        : null)
                      : null
                  }} 
                  isUpcoming={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No upcoming bookings found</p>
              <Button className="mt-4" asChild>
                <Link href="/book">Browse Rooms</Link>
              </Button>
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-6">Past Bookings</h2>
          {pastBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={{
                    ...booking,
                    rooms: Array.isArray(booking.rooms) 
                      ? (booking.rooms[0] 
                        ? { image_urls: booking.rooms[0].image_urls as string[] } 
                        : null)
                      : null
                  }} 
                  isUpcoming={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              No past bookings found
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
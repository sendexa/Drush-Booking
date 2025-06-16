// app/bookings/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import BookingCard from '@/components/booking/BookingCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, DollarSign, XCircle } from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Booking } from '@/types' // Assuming you have a Booking type
import type { User } from '@supabase/supabase-js'

// Wrapper component to handle the suspense boundary
export default function BookingsPageWrapper() {
  return (
    <Suspense fallback={<BookingsPageSkeleton />}>
      <BookingsPage />
    </Suspense>
  )
}

function BookingsPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageBreadcrumb pageTitle="My Bookings" />
      {/* Skeleton content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 animate-pulse h-12 w-12" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BookingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Get filter parameters
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''

  // Create query string for navigation
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get user session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          redirect('/login')
        }
        setUser(user)

        // Fetch user's bookings with room images
        let query = supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            room_id,
            room_type,
            check_in_date,
            check_out_date,
            guests_count,
            total_price,
            status,
            special_requests,
            created_at,
            updated_at,
            rooms:room_id (image_urls)
          `)
          .eq('user_id', user.id)
          .order('check_in_date', { ascending: false })

        // Apply status filter if not 'all'
        if (status !== 'all') {
          query = query.eq('status', status)
        }

        const { data: bookings, error } = await query

        if (error) throw error

        // Filter by search term if provided
        const filteredBookings = search ? bookings.filter(booking => {
          return (
            booking.room_type.toLowerCase().includes(search.toLowerCase()) ||
            booking.special_requests?.toLowerCase().includes(search.toLowerCase())
          )
        }) : bookings

        // Map bookings to include 'guests' property as required by Booking type
        const bookingsWithGuests = (filteredBookings || []).map(booking => ({
          ...booking,
          guests: booking.guests_count // Map guests_count to guests
        }))

        setBookings(bookingsWithGuests)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, search, supabase])

  if (!user) {
    return <BookingsPageSkeleton />
  }

  // Separate upcoming and past bookings
  const now = new Date().toISOString()
  const upcomingBookings = bookings.filter(
    booking => new Date(booking.check_out_date) >= new Date(now)
  );
  const pastBookings = bookings.filter(
    booking => new Date(booking.check_out_date) < new Date(now)
  );

  // Calculate booking statistics
  const stats = {
    totalBookings: bookings.length,
    upcomingStays: upcomingBookings.length,
    totalSpent: bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0),
    cancelledBookings: bookings.filter(booking => booking.status === 'cancelled').length
  }

  return (
    <div className="space-y-8">
      <PageBreadcrumb pageTitle="My Bookings" />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Stays</p>
                <p className="text-2xl font-bold">{stats.upcomingStays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <XCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelledBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button asChild>
          <Link href="/book">Book New Room</Link>
        </Button>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="pl-8"
              defaultValue={search}
              onChange={(e) => {
                router.push(pathname + '?' + createQueryString('search', e.target.value))
              }}
            />
          </div>
          <Select
            defaultValue={status}
            onValueChange={(value) => {
              router.push(pathname + '?' + createQueryString('status', value))
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Upcoming Bookings */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Upcoming Stays</h2>
              <p className="text-sm text-muted-foreground">
                {upcomingBookings.length} {upcomingBookings.length === 1 ? 'booking' : 'bookings'}
              </p>
            </div>

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
                          : undefined)
                        : undefined
                    }} 
                    isUpcoming={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">No upcoming bookings found</p>
                    <Button asChild>
                      <Link href="/book">Browse Available Rooms</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Past Bookings */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Past Bookings</h2>
              <p className="text-sm text-muted-foreground">
                {pastBookings.length} {pastBookings.length === 1 ? 'booking' : 'bookings'}
              </p>
            </div>

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
                          : undefined)
                        : undefined
                    }} 
                    isUpcoming={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">No past bookings found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  )
}


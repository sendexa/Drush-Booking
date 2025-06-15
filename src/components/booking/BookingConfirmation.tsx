// components/booking/BookingConfirmation.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarDays, Users, Hotel, BadgeCheck } from 'lucide-react'
import { format } from 'date-fns'

interface BookingConfirmationProps {
  booking: {
    id: string
    room_type: string
    check_in_date: string
    check_out_date: string
    guests: number
    total_price: number
    status: string
    special_requests?: string
    rooms: {
      id: string
      description: string
      amenities: string[]
      image_urls: string[]
    } | null
  }
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <BadgeCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600">
          Your reservation at D-Rush Lodge is confirmed
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Booking ID: {booking.id}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Hotel className="h-5 w-5 mt-0.5 mr-3 text-blue-500" />
              <div>
                <h3 className="font-semibold">Room Type</h3>
                <p>{booking.room_type}</p>
                {booking.rooms?.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {booking.rooms.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <CalendarDays className="h-5 w-5 mt-0.5 mr-3 text-blue-500" />
              <div>
                <h3 className="font-semibold">Dates</h3>
                <p>
                  {format(new Date(booking.check_in_date), 'MMM d, yyyy')} -{' '}
                  {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.ceil(
                    (new Date(booking.check_out_date).getTime() - 
                    new Date(booking.check_in_date).getTime()
                  ) / (1000 * 60 * 60 * 24)
                  )} nights
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 mt-0.5 mr-3 text-blue-500" />
              <div>
                <h3 className="font-semibold">Guests</h3>
                <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Price Summary</h3>
              <div className="flex justify-between">
                <span>Room rate</span>
                <span>${booking.total_price.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${booking.total_price.toFixed(2)}</span>
              </div>
            </div>

            {booking.special_requests && (
              <div>
                <h3 className="font-semibold mb-1">Special Requests</h3>
                <p className="text-sm text-gray-600">{booking.special_requests}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button asChild className="flex-1">
            <Link href="/my-bookings">View My Bookings</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
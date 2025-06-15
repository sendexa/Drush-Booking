// components/booking/BookingCard.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { BookingWithRoom } from '@/types/booking'

interface BookingCardProps {
  booking: BookingWithRoom
  isUpcoming: boolean
}

export default function BookingCard({ booking, isUpcoming }: BookingCardProps) {
  const firstImage = booking.rooms?.image_urls?.[0] || '/placeholder-room.jpg'
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Calculate payment information based on your business logic
  const paymentInfo = booking.status === 'confirmed' 
    ? 'Paid in full' 
    : booking.status === 'pending'
      ? 'Deposit paid'
      : 'Cancelled'

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <Image
          src={firstImage}
          alt={booking.room_type}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{booking.room_type}</h3>
          <Badge 
            variant={
              booking.status === 'confirmed' 
                ? 'default' 
                : booking.status === 'pending'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <p>
            <span className="font-medium">Dates:</span> {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}
          </p>
          <p>
            <span className="font-medium">Nights:</span> {nights}
          </p>
          <p>
            <span className="font-medium">Guests:</span> {booking.guests}
          </p>
          <p>
            <span className="font-medium">Total:</span> ${booking.total_price.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Payment:</span> {paymentInfo}
          </p>
          {booking.special_requests && (
            <p className="text-gray-600">
              <span className="font-medium">Requests:</span> {booking.special_requests}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/booking-confirmation/${booking.id}`}>View Details</Link>
          </Button>
          {isUpcoming && booking.status !== 'cancelled' && (
            <Button variant="destructive" className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
// components/booking/BookingCard.tsx
"use client";
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
// import { BookingWithRoom } from '@/types/booking'
/*
  Replace the above import with the correct type from '@/types/booking'.
  For example, if the correct type is 'Booking', use:
  import type { Booking } from '@/types/booking'
  and update the code below to use 'Booking' instead of 'BookingWithRoom'.
  If you want to define BookingWithRoom locally for now, you can do:
*/
type BookingWithRoom = {
  id: string
  room_type: string
  rooms?: { image_urls?: string[] }
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: number
  special_requests?: string
  created_at: string
  status: string
}
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Calendar, Clock, Users, CreditCard, MessageSquare } from 'lucide-react'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'

interface BookingCardProps {
  booking: BookingWithRoom
  isUpcoming: boolean
  onCancel?: (bookingId: string) => Promise<void>
}

export default function BookingCard({ booking, isUpcoming, onCancel }: BookingCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const firstImage = booking.rooms?.image_urls?.[0] || '/placeholder-room.jpg'
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  const handleCancel = async () => {
    if (!onCancel) return
    try {
      setIsCancelling(true)
      await onCancel(booking.id)
    } catch (error) {
      console.error('Error cancelling booking:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={firstImage}
          alt={booking.room_type}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <Badge 
            className={`${getStatusColor(booking.status)} border-0`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">{booking.room_type}</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Check-in</p>
              <p className="text-muted-foreground">{format(checkIn, 'MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Check-out</p>
              <p className="text-muted-foreground">{format(checkOut, 'MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Guests</p>
              <p className="text-muted-foreground">{booking.guests}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">Total Amount</p>
            <p className="text-lg font-semibold">${booking.total_price.toFixed(2)}</p>
          </div>
        </div>

        {booking.special_requests && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="font-medium">Special Requests</p>
              <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/booking-confirmation/${booking.id}`}>View Details</Link>
        </Button>
        {isUpcoming && booking.status !== 'cancelled' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1" disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                  Please note that cancellation fees may apply based on our cancellation policy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
                  Yes, Cancel Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}
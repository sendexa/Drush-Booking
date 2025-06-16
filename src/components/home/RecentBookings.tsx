// components/RecentBookings.tsx
import Link from 'next/link'
import { Booking } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Calendar, Users, DollarSign } from 'lucide-react'

export default function RecentBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Bookings</CardTitle>
        <Link 
          href="/my-bookings" 
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent bookings found</p>
            <Link 
              href="/book" 
              className="text-primary hover:underline mt-2 inline-block"
            >
              Book your first stay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{booking.room_type}</h3>
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
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.check_in_date), 'MMM d')} -{' '}
                        {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${booking.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/booking-confirmation/${booking.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
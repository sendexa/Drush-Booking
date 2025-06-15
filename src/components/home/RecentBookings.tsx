// components/RecentBookings.tsx
import Link from 'next/link'
import { Booking } from '@/types/booking' // Define this type based on your schema

export default function RecentBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Bookings</h2>
        <Link href="/my-bookings" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      {bookings.length === 0 ? (
        <p className="text-gray-500">No recent bookings found</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{booking.room_type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.check_in_date).toLocaleDateString()} to{' '}
                    {new Date(booking.check_out_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
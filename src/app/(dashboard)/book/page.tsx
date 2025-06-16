// app/book/page.tsx
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import BookRoomForm from '@/components/booking/BookRoomForm'
import { getAvailableRooms } from '@/utils/supabase/rooms'
import { Card, CardContent } from '@/components/ui/card'
import  PageBreadcrumb  from '@/components/common/PageBreadCrumb'

export default async function BookPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch available rooms for default dates (today + 2 days)
  const defaultCheckIn = new Date()
  const defaultCheckOut = new Date()
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 2)

  const availableRooms = await getAvailableRooms(
    defaultCheckIn.toISOString(),
    defaultCheckOut.toISOString()
  )

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Book a Room" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <BookRoomForm 
                userId={user.id} 
                availableRooms={availableRooms} 
                defaultCheckIn={defaultCheckIn.toISOString()}
                defaultCheckOut={defaultCheckOut.toISOString()}
              />
            </CardContent>
          </Card>
        </div>

        {/* Room Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Booking Information</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  • Check-in time: 2:00 PM
                </p>
                <p>
                  • Check-out time: 11:00 AM
                </p>
                <p>
                  • Free cancellation up to 24 hours before check-in
                </p>
                <p>
                  • 50% deposit required for booking confirmation
                </p>
                <p>
                  • Balance due at check-in
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Need Help?</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Our team is here to help you with your booking. Contact us:
                </p>
                <p>
                  • Phone: +1 (555) 123-4567
                </p>
                <p>
                  • Email: bookings@drushlodge.com
                </p>
                <p>
                  • Hours: 24/7
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
// app/book/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookRoomForm from '@/components/booking/BookRoomForm'
import { getAvailableRooms } from '@/utils/supabase/rooms'

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
    <div className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book a Room</h1>
        <BookRoomForm 
          userId={user.id} 
          availableRooms={availableRooms} 
          defaultCheckIn={defaultCheckIn.toISOString()}
          defaultCheckOut={defaultCheckOut.toISOString()}
        />
      </div>
    </div>
  )
}
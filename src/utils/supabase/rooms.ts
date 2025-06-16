// // utils/supabase/rooms.ts
// import { createClient } from './server'

// export interface Room {
//   id: string
//   room_type: string
//   description: string
//   price_per_night: number
//   capacity: number
//   amenities: string[]
//   image_urls: string[]
//   available_quantity: number
// }

// export async function getAvailableRooms(checkInDate: string, checkOutDate: string) {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .rpc('get_available_rooms', {
//       check_in_date: checkInDate,
//       check_out_date: checkOutDate
//     })

//   if (error) {
//     console.error('Error fetching available rooms:', error)
//     return []
//   }

//   return data as Room[]
// }

// utils/supabase/rooms.ts
import { createClient } from './client'

export interface Room {
  id: string
  room_number: string
  room_type: string
  description: string
  price_per_night: number
  capacity: number
  amenities: string[]
  image_urls: string[]
  available_quantity: number
  is_available?: boolean
}

export async function getAvailableRooms(checkInDate: string, checkOutDate: string): Promise<Room[]> {
  const supabase = await createClient()

  try {
    // First try calling the function
    const { data, error } = await supabase.rpc('get_available_rooms', {
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate
    })

    if (error) throw error
    
    return data as Room[]
  } catch (error) {
    console.error('Error calling get_available_rooms function:', error)
    
    // Fallback to direct query if function fails
    try {
      // First get all booked rooms for the date range
      const { data: bookedRooms, error: bookedError } = await supabase
        .from('bookings')
        .select('room_id')
        .neq('status', 'cancelled')
        .lte('check_in_date', checkOutDate)
        .gte('check_out_date', checkInDate)

      if (bookedError) throw bookedError

      const bookedRoomIds = bookedRooms?.map(b => b.room_id) || []

      // Then get available rooms not in the booked list
      const { data: availableRooms, error: availableError } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          room_type,
          description,
          price_per_night,
          capacity,
          amenities,
          images as image_urls,
          is_available
        `)
        .eq('is_available', true)
        .not('id', 'in', bookedRoomIds.length > 0 ? bookedRoomIds : [''])

      if (availableError) throw availableError

      // Format data to match expected structure
      return (availableRooms || []).map(room => {
        if (room && typeof room === 'object' && !Array.isArray(room)) {
          return { ...(room as Record<string, unknown>), available_quantity: 1 }
        } else {
          return { available_quantity: 1 }
        }
      }) as Room[]
    } catch (fallbackError) {
      console.error('Error in fallback room availability query:', fallbackError)
      throw new Error('Failed to fetch available rooms')
    }
  }
}
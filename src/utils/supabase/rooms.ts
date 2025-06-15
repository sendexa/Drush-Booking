// utils/supabase/rooms.ts
import { createClient } from './server'

export interface Room {
  id: string
  room_type: string
  description: string
  price_per_night: number
  capacity: number
  amenities: string[]
  image_urls: string[]
  available_quantity: number
}

export async function getAvailableRooms(checkInDate: string, checkOutDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_available_rooms', {
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    })

  if (error) {
    console.error('Error fetching available rooms:', error)
    return []
  }

  return data as Room[]
}
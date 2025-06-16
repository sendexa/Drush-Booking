// types/booking.ts
/**
 * Booking status types
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

/**
 * Booking record from the 'bookings' table
 */
// export type Booking = {
//   id: string
//   user_id: string
//   room_type: string
//   check_in_date: string
//   check_out_date: string
//   guests: number
//   status: BookingStatus
//   created_at: string
//   updated_at?: string | null
//   special_requests?: string | null
// }

export type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  status: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  // Add the rooms property to match the Supabase join
  rooms?: { image_urls: string[] }[] | null;
  // ...other properties
  guests: number
};


// types/booking.ts
// export interface Booking {
//   id: string
//   user_id: string
//   room_id: string
//   room_type: string
//   check_in_date: string
//   check_out_date: string
//   guests: number
//   total_price: number
//   status: 'confirmed' | 'pending' | 'cancelled'
//   special_requests?: string | null
//   created_at: string
//   updated_at?: string | null
// }

// export interface BookingWithRoom extends Booking {
//   rooms: {
//     image_urls: string[]
//   } | null
// }

/**
 * Form data for creating/updating a booking
 */
export type BookingFormData = {
  room_type: string
  check_in_date: string
  check_out_date: string
  guests: number
  special_requests?: string
}

/**
 * Stats about user bookings
 */
export type BookingStats = {
  totalBookings: number | null
  upcomingBookings: number | null
  cancelledBookings: number | null
  completedBookings: number | null
}

/**
 * Available room types
 */
export const ROOM_TYPES = [
  'Standard',
  'Deluxe',
  'Suite',
  'Family',
  'Executive'
] as const

export type RoomType = typeof ROOM_TYPES[number]
// components/booking/BookRoomForm.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Room } from '@/utils/supabase/rooms'

const formSchema = z.object({
  roomType: z.string().min(1, 'Please select a room type'),
  checkInDate: z.date({
    required_error: 'Check-in date is required',
  }),
  checkOutDate: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number().min(1, 'At least 1 guest is required').max(6, 'Maximum 6 guests allowed'),
  specialRequests: z.string().optional(),
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"]
})

interface BookRoomFormProps {
  userId: string
  availableRooms: Room[]
  defaultCheckIn: string
  defaultCheckOut: string
}

export default function BookRoomForm({ 
  userId, 
  availableRooms,
  defaultCheckIn,
  defaultCheckOut
}: BookRoomFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(availableRooms)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType: '',
      checkInDate: new Date(defaultCheckIn),
      checkOutDate: new Date(defaultCheckOut),
      guests: 1,
      specialRequests: ''
    }
  })

  // Watch date changes to update available rooms
  const watchDates = form.watch(['checkInDate', 'checkOutDate'])

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (watchDates[0] && watchDates[1]) {
        const { data } = await supabase
          .rpc('get_available_rooms', {
            check_in_date: watchDates[0].toISOString(),
            check_out_date: watchDates[1].toISOString()
          })
        
        if (data) {
          setFilteredRooms(data)
        }
      }
    }

    fetchAvailableRooms()
  }, [watchDates, supabase])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // Find the selected room
      const selectedRoom = filteredRooms.find(room => room.room_type === values.roomType)
      
      if (!selectedRoom) {
        toast.error('Selected room is no longer available')
        return
      }

      // Calculate total price
      const nights = Math.ceil(
        (values.checkOutDate.getTime() - values.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = selectedRoom.price_per_night * nights

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          room_id: selectedRoom.id,
          room_type: selectedRoom.room_type,
          check_in_date: values.checkInDate.toISOString(),
          check_out_date: values.checkOutDate.toISOString(),
          guests: values.guests,
          total_price: totalPrice,
          status: 'confirmed',
          special_requests: values.specialRequests
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Booking confirmed!')
      router.push(`/booking-confirmation/${booking.id}`)
    } catch (error) {
      toast.error('Booking failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="checkInDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOutDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date <= form.getValues('checkInDate') ||
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Room Type Selection */}
        <FormField
          control={form.control}
          name="roomType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredRooms.map((room) => (
                    <SelectItem 
                      key={room.id} 
                      value={room.room_type}
                      disabled={room.available_quantity <= 0}
                    >
                      {room.room_type} - ${room.price_per_night}/night
                      {room.available_quantity <= 0 && ' (Sold out)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Guests */}
        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Any special requirements or preferences..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Confirm Booking"}
        </Button>
      </form>
    </Form>
  )
}
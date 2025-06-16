// components/booking/BookRoomForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, BedDouble, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { getAvailableRooms, Room } from "@/utils/supabase/rooms";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const formSchema = z
  .object({
    roomType: z.string().min(1, "Please select a room type"),
    checkInDate: z.date({
      required_error: "Check-in date is required",
    }),
    checkOutDate: z.date({
      required_error: "Check-out date is required",
    }),
    guests: z
      .number()
      .min(1, "At least 1 guest is required")
      .max(6, "Maximum 6 guests allowed"),
    specialRequests: z.string().optional(),
    paymentOption: z.enum(["full", "half"], {
      required_error: "Please select a payment option",
    }),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

interface BookRoomFormProps {
  userId: string;
  availableRooms: Room[];
  defaultCheckIn: string;
  defaultCheckOut: string;
}

export default function BookRoomForm({
  userId,
  availableRooms,
  defaultCheckIn,
  defaultCheckOut,
}: BookRoomFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(availableRooms);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType: "",
      checkInDate: new Date(defaultCheckIn),
      checkOutDate: new Date(defaultCheckOut),
      guests: 1,
      specialRequests: "",
      paymentOption: "full",
    },
  });

  // Watch date and room changes to update available rooms
  const [checkInDate, checkOutDate, roomType] = form.watch([
    "checkInDate",
    "checkOutDate",
    "roomType",
  ]);



// In your BookRoomForm.tsx
useEffect(() => {
  const fetchAvailableRooms = async () => {
    if (checkInDate && checkOutDate) {
      try {
        const availableRooms = await getAvailableRooms(
          checkInDate.toISOString(),
          checkOutDate.toISOString()
        );
        
        setFilteredRooms(availableRooms);
        if (roomType && !availableRooms.some(room => room.room_type === roomType)) {
          form.setValue("roomType", "");
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Error checking room availability");
      }
    }
  };

  fetchAvailableRooms();
}, [checkInDate, checkOutDate, form, roomType]);

  // Calculate price when room or dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && roomType) {
      const selectedRoom = filteredRooms.find(
        (room) => room.room_type === roomType
      );
      if (selectedRoom) {
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        setTotalPrice(selectedRoom.price_per_night * nights);
      }
    } else {
      setTotalPrice(0);
    }
  }, [checkInDate, checkOutDate, roomType, filteredRooms]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const selectedRoom = filteredRooms.find(
        (room) => room.room_type === values.roomType
      );

      if (!selectedRoom) {
        toast.error("Selected room is no longer available");
        return;
      }

      // Calculate total price and amount to pay
      const nights = Math.ceil(
        (values.checkOutDate.getTime() - values.checkInDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const fullPrice = selectedRoom.price_per_night * nights;
      const amountToPay =
        values.paymentOption === "full" ? fullPrice : fullPrice * 0.5;

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          room_id: selectedRoom.id,
          room_type: selectedRoom.room_type,
          check_in_date: values.checkInDate.toISOString(),
          check_out_date: values.checkOutDate.toISOString(),
          guests: values.guests,
          total_price: fullPrice,
          amount_paid: amountToPay,
          payment_option: values.paymentOption,
          status: values.paymentOption === "full" ? "confirmed" : "pending",
          special_requests: values.specialRequests,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(
        `Booking ${values.paymentOption === "full" ? "confirmed" : "pending"}!`
      );
      router.push(`/booking-confirmation/${booking.id}`);
    } catch (error) {
      toast.error("Booking failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedRoom = filteredRooms.find(
    (room) => room.room_type === roomType
  );

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Room Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Your Room</h3>
            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                          {room.available_quantity <= 0 && " (Sold out)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Selected Room Preview */}
          {selectedRoom && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Image */}
                  <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedRoom.image_urls[0] || '/placeholder-room.jpg'}
                      alt={selectedRoom.room_type}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Room Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRoom.room_type}</h3>
                      <p className="text-sm text-muted-foreground">{selectedRoom.description}</p>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        <span>Sleeps {selectedRoom.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Max {selectedRoom.capacity} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates and Guests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          date <= form.getValues("checkInDate") ||
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
                      max={selectedRoom?.capacity || 6}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          {/* Price Summary */}
          {totalPrice > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Room rate per night</span>
                    <span>${selectedRoom?.price_per_night.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of nights</span>
                    <span>
                      {Math.ceil(
                        (checkOutDate.getTime() - checkInDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Price</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Options */}
          <FormField
            control={form.control}
            name="paymentOption"
            render={({ field }) => {
              const depositAmount = totalPrice * 0.5;
              const balanceDue = totalPrice - depositAmount;

              return (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Option</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="full" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pay Full Amount (${totalPrice.toFixed(2)})
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="half" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pay 50% Deposit (${depositAmount.toFixed(2)})
                          {totalPrice > 0 && (
                            <span className="text-sm text-muted-foreground ml-1">
                              (Balance of ${balanceDue.toFixed(2)} due at
                              check-in)
                            </span>
                          )}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Booking"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

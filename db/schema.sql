-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE room_type AS ENUM ('standard', 'deluxe', 'suite', 'family');
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE support_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'booking_cancellation', 'payment_received', 'support_ticket', 'system');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL  
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    room_type room_type NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb,
    images TEXT[] DEFAULT '{}'::text[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    room_id UUID REFERENCES rooms(id) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending'::booking_status,
    special_requests TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT valid_guests CHECK (guests_count > 0)
);

-- Create support_tickets table
CREATE TABLE support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status support_ticket_status DEFAULT 'open'::support_ticket_status,
    priority support_ticket_priority DEFAULT 'medium'::support_ticket_priority,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- Can reference bookings, support_tickets, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create room_availability table
CREATE TABLE room_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(room_id, date)
);

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_availability_updated_at
    BEFORE UPDATE ON room_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on booking status change
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, type, title, message, related_id)
        VALUES (
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'confirmed' THEN 'booking_confirmation'::notification_type
                WHEN NEW.status = 'cancelled' THEN 'booking_cancellation'::notification_type
                ELSE 'system'::notification_type
            END,
            CASE 
                WHEN NEW.status = 'confirmed' THEN 'Booking Confirmed'
                WHEN NEW.status = 'cancelled' THEN 'Booking Cancelled'
                ELSE 'Booking Status Updated'
            END,
            CASE 
                WHEN NEW.status = 'confirmed' THEN 'Your booking has been confirmed.'
                WHEN NEW.status = 'cancelled' THEN 'Your booking has been cancelled.'
                ELSE 'Your booking status has been updated to ' || NEW.status
            END,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for booking notifications
CREATE TRIGGER booking_status_notification
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_notification();

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Rooms policies
CREATE POLICY "Anyone can view available rooms"
    ON rooms FOR SELECT
    USING (is_available = true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id);

-- Support tickets policies
CREATE POLICY "Users can view their own support tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM bookings WHERE id = payments.booking_id
    ));

-- Room availability policies
CREATE POLICY "Anyone can view room availability"
    ON room_availability FOR SELECT
    USING (true);

-- Insert some sample data

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, description, price_per_night, capacity, amenities, images)
VALUES
    ('101', 'standard', 'Comfortable standard room with city view', 100.00, 2, 
     '["WiFi", "TV", "Air Conditioning", "Mini Bar"]'::jsonb,
     ARRAY['/images/rooms/standard-1.jpg', '/images/rooms/standard-2.jpg']),
    
    ('201', 'deluxe', 'Spacious deluxe room with ocean view', 150.00, 2,
     '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Ocean View", "Balcony"]'::jsonb,
     ARRAY['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg']),
    
    ('301', 'suite', 'Luxury suite with separate living area', 250.00, 4,
     '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Ocean View", "Balcony", "Living Room", "Kitchen"]'::jsonb,
     ARRAY['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg']),
    
    ('401', 'family', 'Family room with two bedrooms', 300.00, 6,
     '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Ocean View", "Balcony", "Two Bedrooms", "Kitchen"]'::jsonb,
     ARRAY['/images/rooms/family-1.jpg', '/images/rooms/family-2.jpg']);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_room_availability_room_date ON room_availability(room_id, date);
CREATE INDEX idx_payments_booking_id ON payments(booking_id); 

-- Add this to your schema.sql file before the RLS policies
CREATE OR REPLACE FUNCTION public.get_available_rooms(
  p_check_in_date TIMESTAMP,
  p_check_out_date TIMESTAMP
)
RETURNS TABLE (
  id UUID,
  room_number TEXT,
  room_type TEXT,
  description TEXT,
  price_per_night DECIMAL(10,2),
  capacity INTEGER,
  amenities JSONB,
  image_urls TEXT[],
  available_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.room_number,
    r.room_type::TEXT,
    r.description,
    r.price_per_night,
    r.capacity,
    r.amenities,
    r.images as image_urls,
    COUNT(r.id) as available_quantity
  FROM 
    rooms r
  WHERE 
    r.is_available = TRUE
    AND NOT EXISTS (
      SELECT 1 
      FROM bookings b
      WHERE 
        b.room_id = r.id
        AND b.status != 'cancelled'
        AND (
          (b.check_in_date <= p_check_out_date::DATE AND b.check_out_date >= p_check_in_date::DATE)
        )
    )
  GROUP BY r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
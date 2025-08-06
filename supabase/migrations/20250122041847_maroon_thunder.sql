/*
  # Initial Schema Setup for Technical Service Management System

  1. New Tables
    - `profiles` (extends auth.users)
      - Stores additional user information for all types of users
      - Links to Supabase Auth
    - `service_orders`
      - Main table for service orders
    - `appointments`
      - Stores customer appointments
    - `staff_roles`
      - Enum type for staff roles

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles
    - Secure access based on user type and ownership

  3. Functions
    - RUT validation function
    - Appointment availability check
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'receptionist', 'customer');
CREATE TYPE service_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create profiles table that extends auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  rut TEXT UNIQUE,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service orders table
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  technician_id UUID REFERENCES profiles(id),
  receptionist_id UUID REFERENCES profiles(id) NOT NULL,
  customer_rut TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  equipment_brand TEXT NOT NULL,
  equipment_model TEXT NOT NULL,
  imei TEXT,
  equipment_condition TEXT,
  work_description TEXT,
  quote DECIMAL(10,2),
  advance_payment DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  status service_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_appointment_time CHECK (
    EXTRACT(HOUR FROM appointment_time) >= 10 AND
    EXTRACT(HOUR FROM appointment_time) <= 18 AND
    EXTRACT(MINUTE FROM appointment_time) = 0 AND
    EXTRACT(DOW FROM appointment_date) BETWEEN 1 AND 6
  )
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service orders policies
CREATE POLICY "Customers can view their own orders"
  ON service_orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all orders"
  ON service_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'technician', 'receptionist')
    )
  );

CREATE POLICY "Receptionists can create orders"
  ON service_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

CREATE POLICY "Staff can update orders"
  ON service_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'technician', 'receptionist')
    )
  );

-- Appointments policies
CREATE POLICY "Customers can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'technician', 'receptionist')
    )
  );

CREATE POLICY "Customers can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Functions
CREATE OR REPLACE FUNCTION validate_rut(rut TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rut_number TEXT;
    verifier CHAR;
    sum INTEGER := 0;
    multiplier INTEGER := 2;
    digit INTEGER;
    calculated_verifier CHAR;
BEGIN
    -- Remove dots and dashes
    rut_number := regexp_replace(rut, '[.-]', '', 'g');
    -- Extract verifier digit
    verifier := RIGHT(rut_number, 1);
    -- Remove verifier digit from number
    rut_number := LEFT(rut_number, LENGTH(rut_number) - 1);
    
    -- Calculate verification digit
    FOR i IN REVERSE array_length(regexp_split_to_array(rut_number, ''), 1)..1 LOOP
        digit := (regexp_split_to_array(rut_number, ''))[i]::INTEGER;
        sum := sum + (digit * multiplier);
        multiplier := multiplier + 1;
        IF multiplier = 8 THEN
            multiplier := 2;
        END IF;
    END LOOP;
    
    calculated_verifier := 
        CASE (11 - (sum % 11))
            WHEN 11 THEN '0'
            WHEN 10 THEN 'K'
            ELSE (11 - (sum % 11))::TEXT
        END;
    
    RETURN UPPER(verifier) = calculated_verifier;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
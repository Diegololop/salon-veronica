/*
  # Fix RLS policies for profiles table

  1. Changes
    - Add policy to allow users to insert their own profile during registration
    - Modify existing policies to be more specific

  2. Security
    - Ensure users can only create their own profile
    - Maintain existing view permissions
*/

-- Drop existing policies to rewrite them more specifically
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to create their own profile during registration
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to view all profiles (needed for basic functionality)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
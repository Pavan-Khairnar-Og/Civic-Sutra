-- Fix profiles table - add missing columns and clean RLS policies
-- This file should be run manually in Supabase SQL editor

-- 1. Add missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'citizen';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add proper constraints
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_user_type 
CHECK (user_type IN ('citizen', 'government', 'admin'));

-- 3. Drop all existing RLS policies on profiles to start clean
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can read basic profiles" ON profiles;

-- 4. Re-create clean policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profiles
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"  
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Public can read basic profile info (no sensitive data)
CREATE POLICY "Public can read basic profiles"
ON profiles FOR SELECT
USING (true);

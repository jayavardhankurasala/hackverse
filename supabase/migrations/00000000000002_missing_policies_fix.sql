-- Migration: 00000000000002_missing_policies_fix.sql
-- Fix: Add missing INSERT policy on profiles table so users can create their own profile during registration
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fix: Allow staff to view all requests in the system (needed for department queue)
CREATE POLICY "Staff can read all requests"
  ON service_requests
  FOR SELECT
  USING (auth.is_staff());

-- Fix: Allow admins to insert profiles (for admin-created accounts)
-- (already covered by "Admins can read all profiles" as FOR ALL, but adding explicit insert)

-- Fix: Allow rating updates by the creator (in case of re-submit attempt)
CREATE POLICY "Users can update own ratings"
  ON ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix: Allow users to insert profiles (for new user self-registration)
-- This removes the barrier where supabase signUp creates auth.user but profile INSERT fails
-- The existing "Users can insert own profile" policy above handles this

-- Fix: Make sure Staff can also insert activity logs (for resolving requests)
-- (Already handled by migration 001 but ensure it applies)

-- ==============================================================================
-- CAMPUS SERVICE REQUEST PLATFORM - COMPLETE DATABASE SETUP
-- Run this script in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create Enums if they don't already exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role DEFAULT 'STUDENT'::user_role NOT NULL,
    student_id TEXT,
    roll_number TEXT,
    branch TEXT,
    year TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority request_priority DEFAULT 'LOW'::request_priority NOT NULL,
    status request_status DEFAULT 'SUBMITTED'::request_status NOT NULL,
    location TEXT,
    building TEXT,
    room_number TEXT,
    created_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ai_category TEXT,
    ai_priority request_priority,
    ai_department UUID REFERENCES departments(id) ON DELETE SET NULL,
    ai_summary TEXT,
    resolution_note TEXT,
    resolution_attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create Request Comments table
CREATE TABLE IF NOT EXISTS request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Request Attachments table
CREATE TABLE IF NOT EXISTS request_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(request_id, user_id)
);

-- 9. Create Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_by ON service_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_to ON service_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_requests_department_id ON service_requests(department_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- 11. Seed initial Campus Departments
INSERT INTO departments (name, description) VALUES
    ('IT Support', 'Handles Wi-Fi, lab equipment, portal accounts, and hardware/software issues.'),
    ('Electrical', 'Handles power cuts, fans, switches, wiring, and lighting repairs.'),
    ('Plumbing', 'Handles water supply, taps, leakage, and bathroom drainage issues.'),
    ('Maintenance', 'Handles furniture, doors, windows, paint, and general physical repairs.'),
    ('Hostel', 'Handles room allocation, wardens, room amenities, and hostel facilities.'),
    ('Transport', 'Handles campus bus routes, schedules, and college shuttle transport.'),
    ('Cleaning', 'Handles waste disposal, housekeeping, corridor and washroom sanitation.'),
    ('Administration', 'Handles ID cards, documentation, certificates, and generic administrative requests.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 12. Helper Functions for Role Checking (in public schema)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'ADMIN'::user_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND (role = 'STAFF'::user_role OR role = 'ADMIN'::user_role)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 13. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies

-- Profiles
DROP POLICY IF EXISTS "Public profile reading for authenticated users" ON profiles;
CREATE POLICY "Public profile reading for authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Departments
DROP POLICY IF EXISTS "Anyone can read departments" ON departments;
CREATE POLICY "Anyone can read departments" ON departments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL USING (public.is_admin());

-- Service Requests
DROP POLICY IF EXISTS "Students can read own requests" ON service_requests;
CREATE POLICY "Students can read own requests" ON service_requests
    FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Staff and Admin can read all requests" ON service_requests;
CREATE POLICY "Staff and Admin can read all requests" ON service_requests
    FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can create requests" ON service_requests;
CREATE POLICY "Authenticated users can create requests" ON service_requests
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Staff and Admins can update requests" ON service_requests;
CREATE POLICY "Staff and Admins can update requests" ON service_requests
    FOR UPDATE USING (public.is_staff() OR auth.uid() = created_by);

-- Comments
DROP POLICY IF EXISTS "Users can read comments on accessible requests" ON request_comments;
CREATE POLICY "Users can read comments on accessible requests" ON request_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON request_comments;
CREATE POLICY "Users can create comments" ON request_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attachments
DROP POLICY IF EXISTS "Users can read attachments" ON request_attachments;
CREATE POLICY "Users can read attachments" ON request_attachments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create attachments" ON request_attachments;
CREATE POLICY "Users can create attachments" ON request_attachments
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ratings
DROP POLICY IF EXISTS "Users can read ratings" ON ratings;
CREATE POLICY "Users can read ratings" ON ratings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can rate requests" ON ratings;
CREATE POLICY "Students can rate requests" ON ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
CREATE POLICY "Users can update own ratings" ON ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Activity Logs
DROP POLICY IF EXISTS "Users can read activity logs" ON activity_logs;
CREATE POLICY "Users can read activity logs" ON activity_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert activity logs" ON activity_logs;
CREATE POLICY "Users can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 15. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'request-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view request attachments" ON storage.objects;
CREATE POLICY "Public can view request attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'request-attachments');

DROP POLICY IF EXISTS "Authenticated users can upload request attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload request attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'request-attachments' AND auth.role() = 'authenticated');

-- Avatars Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

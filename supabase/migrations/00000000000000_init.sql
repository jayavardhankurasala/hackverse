-- Create enums
CREATE TYPE user_role AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
CREATE TYPE request_status AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role DEFAULT 'STUDENT'::user_role NOT NULL,
    student_id TEXT,
    department_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add department_id foreign key to profiles
ALTER TABLE profiles
    ADD CONSTRAINT profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Create service_requests table
CREATE TABLE service_requests (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create request_comments table
CREATE TABLE request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create request_attachments table
CREATE TABLE request_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(request_id, user_id)
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_service_requests_created_by ON service_requests(created_by);
CREATE INDEX idx_service_requests_assigned_to ON service_requests(assigned_to);
CREATE INDEX idx_service_requests_department_id ON service_requests(department_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Seed Departments
INSERT INTO departments (name, description) VALUES
    ('IT Support', 'Handles technology and software-related issues.'),
    ('Electrical', 'Handles power, lighting, and electrical equipment issues.'),
    ('Plumbing', 'Handles water, drainage, and plumbing infrastructure.'),
    ('Maintenance', 'Handles general building maintenance and repairs.'),
    ('Hostel', 'Handles issues related to student accommodation.'),
    ('Transport', 'Handles campus transportation services.'),
    ('Cleaning', 'Handles janitorial and sanitation requests.'),
    ('Administration', 'Handles administrative and generic requests.');

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Functions for Role checks
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN'::user_role
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_staff() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'STAFF'::user_role
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (auth.is_admin());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Departments Policies
CREATE POLICY "Anyone can read departments" ON departments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL USING (auth.is_admin());

-- Service Requests Policies
CREATE POLICY "Students can read own requests" ON service_requests
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Staff can read assigned requests" ON service_requests
    FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "Admins can read all requests" ON service_requests
    FOR SELECT USING (auth.is_admin());

CREATE POLICY "Students can create requests" ON service_requests
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Staff can update assigned requests" ON service_requests
    FOR UPDATE USING (auth.uid() = assigned_to);

CREATE POLICY "Admins can manage all requests" ON service_requests
    FOR ALL USING (auth.is_admin());

-- Request Comments Policies
CREATE POLICY "Users can read comments on their requests" ON request_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = request_comments.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
    );

CREATE POLICY "Users can create comments on accessible requests" ON request_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = request_comments.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
        AND auth.uid() = user_id
    );

-- Notifications Policies
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all notifications" ON notifications
    FOR SELECT USING (auth.is_admin());

-- Ratings Policies
CREATE POLICY "Users can read ratings on their requests" ON ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = ratings.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
    );

CREATE POLICY "Students can create ratings for own requests" ON ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = ratings.request_id
            AND sr.created_by = auth.uid()
            AND sr.status = 'RESOLVED'::request_status
        )
        AND auth.uid() = user_id
    );

-- Activity Logs Policies
CREATE POLICY "Users can read activity logs for accessible requests" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = activity_logs.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
    );

CREATE POLICY "Admins can read all activity logs" ON activity_logs
    FOR SELECT USING (auth.is_admin());

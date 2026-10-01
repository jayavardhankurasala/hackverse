-- Migration: 00000000000001_staff_resolution_and_policies.sql
-- Add resolution columns to service_requests
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS resolution_note TEXT,
ADD COLUMN IF NOT EXISTS resolution_attachment_url TEXT;

-- RLS policies for request_attachments
CREATE POLICY "Users can read attachments for accessible requests" ON request_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = request_attachments.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
    );

CREATE POLICY "Users can insert attachments for accessible requests" ON request_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = request_attachments.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
        AND auth.uid() = uploaded_by
    );

-- RLS policies for activity_logs insertion
CREATE POLICY "Users can insert activity logs for accessible requests" ON activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM service_requests sr
            WHERE sr.id = activity_logs.request_id
            AND (sr.created_by = auth.uid() OR sr.assigned_to = auth.uid() OR auth.is_admin())
        )
    );

-- RLS policies for notifications insertion
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Allow authenticated users to view profiles (needed to see requester name, staff name, comment authors)
CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );

-- ============================================================================
-- STAFFX DATABASE SCHEMA (SUPABASE BACKEND & WORKFORCE PLATFORM)
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gbioimitsenzssoxfqzg/sql/new
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS & PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PROFESSIONAL' CHECK (role IN ('ORGANIZER', 'PROFESSIONAL', 'ADMIN')),
    avatar_url TEXT,
    location TEXT DEFAULT 'Bhopal',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. ORGANIZER PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL DEFAULT 'Corporate Events',
    description TEXT,
    location TEXT DEFAULT 'Bhopal',
    website TEXT,
    completed_events_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. PROFESSIONAL PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    primary_category TEXT NOT NULL DEFAULT 'Event Staff',
    experience_years INTEGER NOT NULL DEFAULT 1,
    location TEXT DEFAULT 'Bhopal',
    availability TEXT NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Weekends Only')),
    hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 250.00,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    completed_jobs_count INTEGER NOT NULL DEFAULT 0,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
    bio TEXT,
    profile_image TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    venue TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    image_url TEXT,
    qr_code_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. STAFFING REQUIREMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staffing_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    required_quantity INTEGER NOT NULL DEFAULT 1 CHECK (required_quantity > 0),
    filled_quantity INTEGER NOT NULL DEFAULT 0 CHECK (filled_quantity >= 0),
    pay_amount NUMERIC(10,2) NOT NULL CHECK (pay_amount >= 0),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_required TEXT,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'FILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. APPLICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES public.staffing_requirements(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED', 'SELECTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CANCELLED')),
    message TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(requirement_id, professional_id)
);

-- ----------------------------------------------------------------------------
-- 7. HIRING / ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES public.staffing_requirements(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    agreed_rate NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 8. ATTENDANCE RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE UNIQUE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'NOT_CHECKED_IN' CHECK (status IN ('NOT_CHECKED_IN', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT')),
    duration_formatted TEXT,
    verification_method TEXT CHECK (verification_method IN ('QR_SCAN', 'MANUAL_OVERRIDE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'FAILED', 'CANCELLED')),
    payment_method TEXT,
    transaction_reference TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('ORGANIZER', 'PROFESSIONAL', 'ADMIN')),
    reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('APPLICATION', 'HIRING', 'ATTENDANCE', 'PAYMENT', 'VERIFICATION', 'SYSTEM')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizer_user_id ON public.organizer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_prof_user_id ON public.professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_reqs_event_id ON public.staffing_requirements(event_id);
CREATE INDEX IF NOT EXISTS idx_apps_requirement_id ON public.applications(requirement_id);
CREATE INDEX IF NOT EXISTS idx_apps_event_id ON public.applications(event_id);
CREATE INDEX IF NOT EXISTS idx_assignments_event_id ON public.assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON public.attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_event_id ON public.payment_records(event_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables client access for both anon and authenticated users
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
CREATE POLICY "Allow select profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true);

-- Organizer Profiles Policies
DROP POLICY IF EXISTS "Allow select organizer_profiles" ON public.organizer_profiles;
CREATE POLICY "Allow select organizer_profiles" ON public.organizer_profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert organizer_profiles" ON public.organizer_profiles;
CREATE POLICY "Allow insert organizer_profiles" ON public.organizer_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update organizer_profiles" ON public.organizer_profiles;
CREATE POLICY "Allow update organizer_profiles" ON public.organizer_profiles FOR UPDATE TO anon, authenticated USING (true);

-- Professional Profiles Policies
DROP POLICY IF EXISTS "Allow select professional_profiles" ON public.professional_profiles;
CREATE POLICY "Allow select professional_profiles" ON public.professional_profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert professional_profiles" ON public.professional_profiles;
CREATE POLICY "Allow insert professional_profiles" ON public.professional_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update professional_profiles" ON public.professional_profiles;
CREATE POLICY "Allow update professional_profiles" ON public.professional_profiles FOR UPDATE TO anon, authenticated USING (true);

-- Events Policies
DROP POLICY IF EXISTS "Allow select events" ON public.events;
CREATE POLICY "Allow select events" ON public.events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert events" ON public.events;
CREATE POLICY "Allow insert events" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update events" ON public.events;
CREATE POLICY "Allow update events" ON public.events FOR UPDATE TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow delete events" ON public.events;
CREATE POLICY "Allow delete events" ON public.events FOR DELETE TO anon, authenticated USING (true);

-- Staffing Requirements Policies
DROP POLICY IF EXISTS "Allow select staffing_requirements" ON public.staffing_requirements;
CREATE POLICY "Allow select staffing_requirements" ON public.staffing_requirements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert staffing_requirements" ON public.staffing_requirements;
CREATE POLICY "Allow insert staffing_requirements" ON public.staffing_requirements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update staffing_requirements" ON public.staffing_requirements;
CREATE POLICY "Allow update staffing_requirements" ON public.staffing_requirements FOR UPDATE TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow delete staffing_requirements" ON public.staffing_requirements;
CREATE POLICY "Allow delete staffing_requirements" ON public.staffing_requirements FOR DELETE TO anon, authenticated USING (true);

-- Applications Policies
DROP POLICY IF EXISTS "Allow select applications" ON public.applications;
CREATE POLICY "Allow select applications" ON public.applications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert applications" ON public.applications;
CREATE POLICY "Allow insert applications" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update applications" ON public.applications;
CREATE POLICY "Allow update applications" ON public.applications FOR UPDATE TO anon, authenticated USING (true);

-- Assignments Policies
DROP POLICY IF EXISTS "Allow select assignments" ON public.assignments;
CREATE POLICY "Allow select assignments" ON public.assignments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert assignments" ON public.assignments;
CREATE POLICY "Allow insert assignments" ON public.assignments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update assignments" ON public.assignments;
CREATE POLICY "Allow update assignments" ON public.assignments FOR UPDATE TO anon, authenticated USING (true);

-- Attendance Records Policies
DROP POLICY IF EXISTS "Allow select attendance_records" ON public.attendance_records;
CREATE POLICY "Allow select attendance_records" ON public.attendance_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert attendance_records" ON public.attendance_records;
CREATE POLICY "Allow insert attendance_records" ON public.attendance_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update attendance_records" ON public.attendance_records;
CREATE POLICY "Allow update attendance_records" ON public.attendance_records FOR UPDATE TO anon, authenticated USING (true);

-- Payment Records Policies
DROP POLICY IF EXISTS "Allow select payment_records" ON public.payment_records;
CREATE POLICY "Allow select payment_records" ON public.payment_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert payment_records" ON public.payment_records;
CREATE POLICY "Allow insert payment_records" ON public.payment_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update payment_records" ON public.payment_records;
CREATE POLICY "Allow update payment_records" ON public.payment_records FOR UPDATE TO anon, authenticated USING (true);

-- Reviews Policies
DROP POLICY IF EXISTS "Allow select reviews" ON public.reviews;
CREATE POLICY "Allow select reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert reviews" ON public.reviews;
CREATE POLICY "Allow insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Allow select notifications" ON public.notifications;
CREATE POLICY "Allow select notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
CREATE POLICY "Allow insert notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update notifications" ON public.notifications;
CREATE POLICY "Allow update notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================================
-- INITIAL SEED DATA (Events, Venues, Roles & Profiles)
-- Populates your database so you can immediately see and manage data
-- ============================================================================
DO $$
DECLARE
    org_user_id UUID := '11111111-1111-1111-1111-111111111111';
    prof1_user_id UUID := '22222222-2222-2222-2222-222222222222';
    prof2_user_id UUID := '33333333-3333-3333-3333-333333333333';
    prof3_user_id UUID := '44444444-4444-4444-4444-444444444444';
    admin_user_id UUID := '99999999-9999-9999-9999-999999999999';

    evt1_id UUID := 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    evt2_id UUID := 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    req1_id UUID := 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    req2_id UUID := 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    req3_id UUID := 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
    -- 1. Profiles
    INSERT INTO public.profiles (id, email, phone, full_name, role, avatar_url, location, status)
    VALUES
        (org_user_id, 'organizer@staffx.com', '+91 98260 12345', 'Rahul Sharma', 'ORGANIZER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof1_user_id, 'arjun@staffx.com', '+91 98260 54321', 'Arjun Kumar', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof2_user_id, 'priya@staffx.com', '+91 98260 67890', 'Priya Sharma', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof3_user_id, 'vikram@staffx.com', '+91 98260 99887', 'Vikram Patel', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', 'Indore', 'ACTIVE'),
        (admin_user_id, 'admin@staffx.com', '+91 98260 00000', 'System Administrator', 'ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Organizer Profile
    INSERT INTO public.organizer_profiles (id, user_id, organization_name, organization_type, description, location, website, completed_events_count, rating, verification_status)
    VALUES
        (gen_random_uuid(), org_user_id, 'Apex Grand Events & Hospitality', 'Premium Wedding & Corporate Planner', 'Leading event production house managing high-profile wedding receptions, conferences, and exhibitions in Central India.', 'Bhopal', 'https://apexevents.example.com', 48, 4.95, 'VERIFIED')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Professional Profiles
    INSERT INTO public.professional_profiles (id, user_id, skills, primary_category, experience_years, location, availability, hourly_rate, rating, completed_jobs_count, verification_status, bio, phone)
    VALUES
        (gen_random_uuid(), prof1_user_id, ARRAY['VIP Security', 'Crowd Management', 'Access Control', 'First Aid'], 'Event Security', 4, 'Bhopal', 'Available', 350.00, 4.92, 38, 'VERIFIED', 'Certified physical security lead with experience managing VIP security zones, corporate summits, and high-footfall cultural galas.', '+91 98260 54321'),
        (gen_random_uuid(), prof2_user_id, ARRAY['Silver Service', 'VIP Guest Hospitality', 'Registration', 'Event Coordination'], 'Hospitality Staff', 3, 'Bhopal', 'Available', 280.00, 4.88, 29, 'VERIFIED', 'Bilingual hospitality and banquet specialist with deep expertise in fine-dining protocols, VIP table service, and seamless registration desk handling.', '+91 98260 67890'),
        (gen_random_uuid(), prof3_user_id, ARRAY['Sound Engineering', 'Lighting Setup', 'Stage Management', 'Video Projection'], 'AV / Stage Production', 5, 'Indore', 'Weekends Only', 420.00, 4.96, 52, 'VERIFIED', 'Specialized stage technician & live sound engineer handling line arrays, DMX intelligent lights, and LED wall switching.', '+91 98260 99887')
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Events
    INSERT INTO public.events (id, organizer_id, name, event_type, venue, location, start_date, end_date, start_time, end_time, description, status, image_url, qr_code_token)
    VALUES
        (evt1_id, org_user_id, 'Royal Rajputana Grand Wedding Reception', 'Wedding Reception', 'Jehan Numa Palace Lawns', 'Shamla Hills, Bhopal', CURRENT_DATE + 3, CURRENT_DATE + 3, '18:00:00', '23:30:00', 'Luxury 1200-guest wedding reception requiring premium banquet service staff, discreet VIP security escorts, and bilingual registration ushers.', 'PUBLISHED', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 'STAFFX-QR-EVT1-55421'),
        (evt2_id, org_user_id, 'Central India Tech Innovation Summit 2026', 'Conference / Exhibition', 'MANIT Convention Auditorium', 'Bhopal', CURRENT_DATE + 10, CURRENT_DATE + 11, '09:00:00', '18:00:00', 'Two-day technology conference featuring 800+ delegates, keynote stages, hackathon tracks, and investor networking lounges.', 'PUBLISHED', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', 'STAFFX-QR-EVT2-88219')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Staffing Requirements
    INSERT INTO public.staffing_requirements (id, event_id, role, required_quantity, filled_quantity, pay_amount, required_skills, experience_required, shift_start, shift_end, description, status)
    VALUES
        (req1_id, evt1_id, 'Banquet & Silver Service Specialist', 12, 1, 1500.00, ARRAY['Silver Service', 'VIP Table Etiquette', 'Bilingual'], '2+ years luxury catering', '17:30:00', '23:30:00', 'Provide VIP banquet table service, food course presentation, and champagne pouring during royal reception dinner.', 'PUBLISHED'),
        (req2_id, evt1_id, 'VIP Executive Security Escort', 6, 1, 2000.00, ARRAY['VIP Security', 'Crowd Management', 'Emergency Protocols'], '3+ years verified security experience', '17:00:00', '00:00:00', 'Maintain perimeter security around VIP dais, escort dignitary arrivals, and coordinate with venue police liaison.', 'PUBLISHED'),
        (req3_id, evt2_id, 'Registration & Delegate Concierge', 8, 0, 1200.00, ARRAY['Registration Desk', 'Badge Printing', 'Guest Welcoming'], 'Fluent English & Hindi', '08:00:00', '18:00:00', 'Handle delegate check-ins, QR badge printing, speaker lounge coordination, and informational queries.', 'PUBLISHED')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Initial Applications & Assignments
    INSERT INTO public.applications (id, requirement_id, event_id, professional_id, status, message)
    VALUES
        ('d1111111-dddd-dddd-dddd-dddddddddddd', req1_id, evt1_id, prof2_user_id, 'ACCEPTED', 'Experienced in high-end wedding banquets. Excited to lead table coordination.')
    ON CONFLICT (requirement_id, professional_id) DO NOTHING;

    INSERT INTO public.assignments (id, requirement_id, event_id, organizer_id, professional_id, role, agreed_rate, status)
    VALUES
        ('c1111111-cccc-cccc-cccc-cccccccccccc', req1_id, evt1_id, org_user_id, prof2_user_id, 'Banquet & Silver Service Specialist', 1500.00, 'CONFIRMED')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Initial Attendance Record
    INSERT INTO public.attendance_records (id, assignment_id, event_id, professional_id, status, duration_formatted)
    VALUES
        ('e1111111-eeee-eeee-eeee-eeeeeeeeeeee', 'c1111111-cccc-cccc-cccc-cccccccccccc', evt1_id, prof2_user_id, 'NOT_CHECKED_IN', 'Shift not started')
    ON CONFLICT (assignment_id) DO NOTHING;

    -- 8. Initial Payment Record
    INSERT INTO public.payment_records (id, assignment_id, event_id, organizer_id, professional_id, role, amount, status)
    VALUES
        ('f1111111-ffff-ffff-ffff-ffffffffffff', 'c1111111-cccc-cccc-cccc-cccccccccccc', evt1_id, org_user_id, prof2_user_id, 'Banquet & Silver Service Specialist', 1500.00, 'PENDING')
    ON CONFLICT (id) DO NOTHING;

END $$;

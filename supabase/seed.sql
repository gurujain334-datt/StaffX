-- ============================================================================
-- STAFFX SEED & DEMO DATA (PHASE 2)
-- Event Staffing & Workforce Management Platform
-- ============================================================================

-- Note: In production Supabase, UUIDs for users correspond to auth.users.
-- For local/testing development, we seed static reference UUIDs:
DO $$
DECLARE
    org_user_id UUID := '11111111-1111-1111-1111-111111111111';
    prof1_user_id UUID := '22222222-2222-2222-2222-222222222222';
    prof2_user_id UUID := '33333333-3333-3333-3333-333333333333';
    prof3_user_id UUID := '44444444-4444-4444-4444-444444444444';
    admin_user_id UUID := '99999999-9999-9999-9999-999999999999';

    evt1_id UUID := 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    evt2_id UUID := 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    req1_waiter_id UUID := 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    req2_security_id UUID := 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    req3_usher_id UUID := 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    assign1_id UUID := 'c1111111-cccc-cccc-cccc-cccccccccccc';
    assign2_id UUID := 'c2222222-cccc-cccc-cccc-cccccccccccc';
BEGIN

    -- 1. Insert Demo Profiles
    INSERT INTO public.profiles (id, email, phone, full_name, role, avatar_url, location, status)
    VALUES
        (org_user_id, 'organizer@staffx.com', '+91 98260 12345', 'Rahul Sharma', 'ORGANIZER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof1_user_id, 'arjun@staffx.com', '+91 98260 54321', 'Arjun Kumar', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof2_user_id, 'priya@staffx.com', '+91 98260 67890', 'Priya Sharma', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE'),
        (prof3_user_id, 'vikram@staffx.com', '+91 98260 99887', 'Vikram Patel', 'PROFESSIONAL', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', 'Indore', 'ACTIVE'),
        (admin_user_id, 'admin@staffx.com', '+91 98260 00000', 'System Administrator', 'ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', 'Bhopal', 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Organizer Profile
    INSERT INTO public.organizer_profiles (id, user_id, organization_name, organization_type, description, location, website, completed_events_count, rating, verification_status)
    VALUES
        (gen_random_uuid(), org_user_id, 'Apex Grand Events & Hospitality', 'Premium Wedding & Corporate Planner', 'Leading event production house managing high-profile wedding receptions, conferences, and exhibitions in Central India.', 'Bhopal', 'https://apexevents.example.com', 48, 4.95, 'VERIFIED')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Insert Professional Profiles
    INSERT INTO public.professional_profiles (id, user_id, skills, primary_category, experience_years, location, availability, hourly_rate, rating, completed_jobs_count, verification_status, bio, phone)
    VALUES
        (gen_random_uuid(), prof1_user_id, ARRAY['VIP Security', 'Crowd Management', 'Access Control', 'First Aid'], 'Event Security', 4, 'Bhopal', 'Available', 350.00, 4.92, 38, 'VERIFIED', 'Certified physical security lead with experience managing VIP security zones, corporate summits, and high-footfall cultural galas.', '+91 98260 54321'),
        (gen_random_uuid(), prof2_user_id, ARRAY['Silver Service', 'VIP Guest Hospitality', 'Registration', 'Event Coordination'], 'Hospitality Staff', 3, 'Bhopal', 'Available', 280.00, 4.88, 29, 'VERIFIED', 'Bilingual hospitality and banquet specialist with deep expertise in fine-dining protocols, VIP table service, and seamless registration desk handling.', '+91 98260 67890'),
        (gen_random_uuid(), prof3_user_id, ARRAY['Sound Engineering', 'Lighting Setup', 'Stage Management', 'Video Projection'], 'AV / Stage Production', 5, 'Indore', 'Weekends Only', 420.00, 4.96, 52, 'VERIFIED', 'Specialized stage technician & live sound engineer handling line arrays, DMX intelligent lights, and LED wall switching.', '+91 98260 99887')
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Insert Demo Events
    INSERT INTO public.events (id, organizer_id, name, event_type, venue, location, start_date, end_date, start_time, end_time, description, status, image_url, qr_code_token)
    VALUES
        (evt1_id, org_user_id, 'Royal Rajputana Grand Wedding Reception', 'Wedding Reception', 'Jehan Numa Palace Lawns', 'Shamla Hills, Bhopal', CURRENT_DATE + 3, CURRENT_DATE + 3, '18:00:00', '23:30:00', 'Luxury 1200-guest wedding reception requiring premium banquet service staff, discreet VIP security escorts, and bilingual registration ushers.', 'PUBLISHED', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 'EVT-WEDDING-2026-TOKEN'),
        (evt2_id, org_user_id, 'Central India Tech Innovation Summit 2026', 'Conference / Exhibition', 'MANIT Convention Auditorium', 'Bhopal', CURRENT_DATE + 10, CURRENT_DATE + 11, '09:00:00', '18:00:00', 'Two-day technology conference featuring 800+ delegates, keynote stages, hackathon tracks, and investor networking lounges.', 'PUBLISHED', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', 'EVT-TECHSUMMIT-2026-TOKEN')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insert Staffing Requirements
    INSERT INTO public.staffing_requirements (id, event_id, role, required_quantity, filled_quantity, pay_amount, required_skills, experience_required, shift_start, shift_end, description, status)
    VALUES
        (req1_waiter_id, evt1_id, 'Banquet Waiter / Server', 10, 6, 2500.00, ARRAY['Silver Service', 'Tray Balancing', 'Guest Etiquette'], '2+ years in 5-star or banquet setups', '17:30:00', '23:30:00', 'Serve dinner courses, beverage stations, and clear dining tables with polite etiquette. Black trousers and white shirt uniform provided.', 'PUBLISHED'),
        (req2_security_id, evt1_id, 'VIP Event Security Guard', 4, 2, 3200.00, ARRAY['Access Control', 'Crowd Management', 'VIP Escort'], '3+ years in private event security', '17:00:00', '00:00:00', 'Ensure secure perimeter at main entrance gates and VIP bridal staging area. Suit and communication headset required.', 'PUBLISHED'),
        (req3_usher_id, evt2_id, 'Delegate Registration Usher', 6, 3, 2200.00, ARRAY['Registration Desk', 'Badge Printing', 'Guest Relations'], '1+ years in corporate events', '08:00:00', '16:00:00', 'Welcome incoming delegates, scan QR entry passes, distribute lanyard badges, and direct visitors to auditoriums.', 'PUBLISHED')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Applications
    INSERT INTO public.applications (id, requirement_id, event_id, professional_id, status, message, applied_at)
    VALUES
        (gen_random_uuid(), req1_waiter_id, evt1_id, prof2_user_id, 'ACCEPTED', 'Excited to bring my silver service banquet background to the Jehan Numa reception!', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (gen_random_uuid(), req2_security_id, evt1_id, prof1_user_id, 'ACCEPTED', 'I have previously managed VIP access at Jehan Numa Palace and know the property layouts intimately.', CURRENT_TIMESTAMP - INTERVAL '1 day')
    ON CONFLICT (requirement_id, professional_id) DO NOTHING;

    -- 7. Insert Assignments (Hiring)
    INSERT INTO public.assignments (id, requirement_id, event_id, organizer_id, professional_id, role, agreed_rate, status, assigned_at)
    VALUES
        (assign1_id, req2_security_id, evt1_id, org_user_id, prof1_user_id, 'VIP Event Security Guard', 3200.00, 'CONFIRMED', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
        (assign2_id, req1_waiter_id, evt1_id, org_user_id, prof2_user_id, 'Banquet Waiter / Server', 2500.00, 'CONFIRMED', CURRENT_TIMESTAMP - INTERVAL '12 hours')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Insert Attendance Records
    INSERT INTO public.attendance_records (id, assignment_id, event_id, professional_id, check_in_at, check_out_at, status, verification_method, duration_formatted)
    VALUES
        (gen_random_uuid(), assign1_id, evt1_id, prof1_user_id, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL),
        (gen_random_uuid(), assign2_id, evt1_id, prof2_user_id, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL)
    ON CONFLICT (assignment_id) DO NOTHING;

    -- 9. Insert Payment Records
    INSERT INTO public.payment_records (id, assignment_id, event_id, organizer_id, professional_id, role, amount, status, payment_method, transaction_reference)
    VALUES
        (gen_random_uuid(), assign1_id, evt1_id, org_user_id, prof1_user_id, 'VIP Event Security Guard', 3200.00, 'PENDING', 'Bank Transfer / UPI Escrow', 'ESC-STX-98231'),
        (gen_random_uuid(), assign2_id, evt1_id, org_user_id, prof2_user_id, 'Banquet Waiter / Server', 2500.00, 'PENDING', 'Bank Transfer / UPI Escrow', 'ESC-STX-98232')
    ON CONFLICT (id) DO NOTHING;

    -- 10. Insert Demo Reviews
    INSERT INTO public.reviews (id, assignment_id, reviewer_id, reviewer_role, reviewed_user_id, rating, comment)
    VALUES
        (gen_random_uuid(), assign1_id, org_user_id, 'ORGANIZER', prof1_user_id, 5.0, 'Arjun was stellar at managing the entrance checkpoint. Prompt arrival and impeccable professionalism.'),
        (gen_random_uuid(), assign2_id, prof2_user_id, 'PROFESSIONAL', org_user_id, 4.9, 'Apex Grand Events was extremely organized, provided clear briefing and punctual payment settlements.')
    ON CONFLICT (id) DO NOTHING;

    -- 11. Insert Notifications
    INSERT INTO public.notifications (id, recipient_id, type, title, message)
    VALUES
        (gen_random_uuid(), org_user_id, 'APPLICATION', 'New Application Received', 'Priya Sharma applied for Banquet Waiter at Royal Rajputana Grand Wedding Reception.'),
        (gen_random_uuid(), prof1_user_id, 'HIRING', 'Shift Confirmed!', 'You have been confirmed for VIP Event Security Guard at Jehan Numa Palace.'),
        (gen_random_uuid(), prof2_user_id, 'HIRING', 'Shift Confirmed!', 'You have been confirmed for Banquet Waiter at Jehan Numa Palace.')
    ON CONFLICT (id) DO NOTHING;

END $$;

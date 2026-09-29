import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

export const seedRouter = Router();

// Secure Seeding Endpoint
seedRouter.post('/seed', async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowSeeding = process.env.ALLOW_DEMO_SEEDING === 'true';
  const seedToken = process.env.DEMO_SEED_TOKEN || 'my_secret_demo_token_123';

  // Strict Production Check
  if (isProduction && !allowSeeding) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Seeding is strictly disabled in production environments.',
    });
  }

  // Token Authentication check
  const providedToken = req.headers['x-seed-token'] || req.query.token;
  if (!providedToken || providedToken !== seedToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing secure seed token.',
    });
  }

  // Retrieve Supabase environment variables on server side
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      success: false,
      message: 'Supabase URL or Key not configured on the server. Running seeding process in offline/mock mode.',
      fallback: true,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const shouldPurge = req.body.purge === true;
    let purgeMessage = '';

    // If request asks to purge first, delete event-specific records to prevent primary key conflicts
    if (shouldPurge) {
      // 1. Delete dependent tables for demo wedding event
      const demoEventId = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const demoEvent2Id = 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      
      await supabase.from('reviews').delete().or(`reviewer_id.eq.11111111-1111-1111-1111-111111111111,reviewed_user_id.eq.11111111-1111-1111-1111-111111111111`);
      await supabase.from('payment_records').delete().or(`event_id.eq.${demoEventId},event_id.eq.${demoEvent2Id}`);
      await supabase.from('attendance_records').delete().or(`event_id.eq.${demoEventId},event_id.eq.${demoEvent2Id}`);
      await supabase.from('assignments').delete().or(`event_id.eq.${demoEventId},event_id.eq.${demoEvent2Id}`);
      await supabase.from('applications').delete().or(`event_id.eq.${demoEventId},event_id.eq.${demoEvent2Id}`);
      await supabase.from('staffing_requirements').delete().or(`event_id.eq.${demoEventId},event_id.eq.${demoEvent2Id}`);
      await supabase.from('events').delete().or(`id.eq.${demoEventId},id.eq.${demoEvent2Id}`);
      
      purgeMessage = 'Existing demo event dependencies purged successfully. ';
    }

    // 1. Insert Demo Organizer & Professional Profiles
    const org_user_id = '11111111-1111-1111-1111-111111111111';
    const prof1_user_id = '22222222-2222-2222-2222-222222222222';
    const prof2_user_id = '33333333-3333-3333-3333-333333333333';

    await supabase.from('profiles').upsert([
      {
        id: org_user_id,
        email: 'organizer@staffx.com',
        phone: '+91 98260 12345',
        full_name: 'Rahul Sharma',
        role: 'ORGANIZER',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        location: 'Bhopal',
        status: 'ACTIVE',
      },
      {
        id: prof1_user_id,
        email: 'arjun@staffx.com',
        phone: '+91 98260 54321',
        full_name: 'Arjun Kumar',
        role: 'PROFESSIONAL',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        location: 'Bhopal',
        status: 'ACTIVE',
      },
      {
        id: prof2_user_id,
        email: 'priya@staffx.com',
        phone: '+91 98260 67890',
        full_name: 'Priya Sharma',
        role: 'PROFESSIONAL',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        location: 'Bhopal',
        status: 'ACTIVE',
      }
    ], { onConflict: 'id' });

    // 2. Insert Organizer Profile Metadata
    await supabase.from('organizer_profiles').upsert([
      {
        user_id: org_user_id,
        organization_name: 'Apex Grand Events & Hospitality',
        organization_type: 'Premium Wedding & Corporate Planner',
        description: 'Leading event production house managing high-profile wedding receptions, conferences, and exhibitions in Central India.',
        location: 'Bhopal',
        website: 'https://apexevents.example.com',
        completed_events_count: 48,
        rating: 4.95,
        verification_status: 'VERIFIED'
      }
    ], { onConflict: 'user_id' });

    // 3. Insert Professional Profiles Metadata
    await supabase.from('professional_profiles').upsert([
      {
        user_id: prof1_user_id,
        skills: ['VIP Security', 'Crowd Management', 'Access Control', 'First Aid'],
        primary_category: 'Event Security',
        experience_years: 4,
        location: 'Bhopal',
        availability: 'Available',
        hourly_rate: 350.00,
        rating: 4.92,
        completed_jobs_count: 38,
        verification_status: 'VERIFIED',
        bio: 'Certified physical security lead with experience managing VIP security zones, corporate summits, and high-footfall cultural galas.',
        phone: '+91 98260 54321'
      },
      {
        user_id: prof2_user_id,
        skills: ['Silver Service', 'VIP Guest Hospitality', 'Registration', 'Event Coordination'],
        primary_category: 'Hospitality Staff',
        experience_years: 3,
        location: 'Bhopal',
        availability: 'Available',
        hourly_rate: 280.00,
        rating: 4.88,
        completed_jobs_count: 29,
        verification_status: 'VERIFIED',
        bio: 'Bilingual hospitality and banquet specialist with deep expertise in fine-dining protocols, VIP table service, and seamless registration desk handling.',
        phone: '+91 98260 67890'
      }
    ], { onConflict: 'user_id' });

    // 4. Insert Main Demo Event: Grand Wedding Reception
    const weddingEventId = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    await supabase.from('events').upsert([
      {
        id: weddingEventId,
        organizer_id: org_user_id,
        name: 'Grand Wedding Reception',
        event_type: 'Wedding Reception',
        venue: 'Jehan Numa Palace Lawns',
        location: 'Shamla Hills, Bhopal',
        start_date: '2026-10-25',
        end_date: '2026-10-25',
        start_time: '17:00:00',
        end_time: '23:00:00',
        description: 'Grand Wedding Reception for 500 guests. Requires premium banquet service staff, discreet VIP security escorts, bilingual coordinators, and venue cleaners.',
        status: 'PUBLISHED',
        image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        qr_code_token: 'STAFFX-QR-EVT-WEDDING-2026'
      }
    ], { onConflict: 'id' });

    // 5. Insert Staffing Requirements matching Step 8 Headcount Exactly
    const reqWaiterId = 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const reqSecurityId = 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const reqCoordinatorId = 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const reqCleanerId = 'b4444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    await supabase.from('staffing_requirements').upsert([
      {
        id: reqWaiterId,
        event_id: weddingEventId,
        role: 'Waiter',
        required_quantity: 15,
        filled_quantity: 10,
        pay_amount: 1200.00,
        required_skills: ['Silver Service', 'Tray Balancing', 'Guest Etiquette'],
        experience_required: 'Previous event experience preferred',
        shift_start: '17:00:00',
        shift_end: '23:00:00',
        description: 'Serve snacks, beverages, and wedding dinner buffet with polite hospitality. Black trousers and white shirt provided.',
        status: 'PUBLISHED'
      },
      {
        id: reqSecurityId,
        event_id: weddingEventId,
        role: 'Security Guard',
        required_quantity: 6,
        filled_quantity: 2,
        pay_amount: 1500.00,
        required_skills: ['Access Control', 'Crowd Management', 'VIP Escort'],
        experience_required: '1+ year event security',
        shift_start: '17:00:00',
        shift_end: '23:00:00',
        description: 'Ensure gate screening, manage main entrance gate flow, and valet parking perimeter security.',
        status: 'PUBLISHED'
      },
      {
        id: reqCoordinatorId,
        event_id: weddingEventId,
        role: 'Event Coordinator',
        required_quantity: 2,
        filled_quantity: 1,
        pay_amount: 1800.00,
        required_skills: ['Event Management', 'VIP Protocol', 'Guest Relations'],
        experience_required: '2+ years hospitality experience',
        shift_start: '17:00:00',
        shift_end: '23:00:00',
        description: 'Welcome and assist incoming elite VIP guests, maintain schedule coordination with vendors.',
        status: 'PUBLISHED'
      },
      {
        id: reqCleanerId,
        event_id: weddingEventId,
        role: 'Cleaner',
        required_quantity: 4,
        filled_quantity: 1,
        pay_amount: 1000.00,
        required_skills: ['Venue Sanitization', 'Cleaning', 'Waste Disposal'],
        experience_required: 'Punctual & detail-oriented',
        shift_start: '17:00:00',
        shift_end: '23:00:00',
        description: 'Maintain pristine cleanliness across the dining area, clear waste plates, and sanitize tables.',
        status: 'PUBLISHED'
      }
    ], { onConflict: 'id' });

    // 6. Create realistic assignments, applications, and logs for Arjun and Priya
    const appWaiterId = 'd1111111-dddd-dddd-dddd-dddddddddddd';
    const appSecurityId = 'd2222222-dddd-dddd-dddd-dddddddddddd';

    await supabase.from('applications').upsert([
      {
        id: appWaiterId,
        requirement_id: reqWaiterId,
        event_id: weddingEventId,
        professional_id: prof2_user_id,
        status: 'ACCEPTED',
        message: 'Excited to offer premium banquet silver service at Jehan Numa reception!',
        applied_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: appSecurityId,
        requirement_id: reqSecurityId,
        event_id: weddingEventId,
        professional_id: prof1_user_id,
        status: 'ACCEPTED',
        message: 'Experienced guard. Managed multiple high-society wedding lawns previously.',
        applied_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ], { onConflict: 'requirement_id, professional_id' });

    return res.json({
      success: true,
      message: `${purgeMessage}Database seeded successfully with the 'Grand Wedding Reception' (500 guests) and realistic staffing profiles!`,
      details: {
        event: 'Grand Wedding Reception',
        location: 'Jehan Numa Palace Lawns, Bhopal',
        requirements: {
          waiters: 15,
          guards: 6,
          coordinators: 2,
          cleaners: 4
        }
      }
    });

  } catch (error: any) {
    console.error('Database seeding error:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Seeding failed due to database query exception.',
      details: error?.message || error
    });
  }
});

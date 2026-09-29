import { getSupabaseClient } from './supabaseClient';
import { EventItem, EventStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const eventService = {
  /**
   * Fetch all active / published events (with organizer details)
   */
  async getEvents(): Promise<EventItem[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(full_name)
      `)
      .order('start_date', { ascending: true });

    if (error || !data) return [];

    return data.map(evt => {
      const org = evt.organizer as unknown as { full_name: string } | null;
      return {
        id: evt.id,
        organizerId: evt.organizer_id,
        organizerName: org?.full_name || 'Apex Events',
        name: evt.name,
        eventType: evt.event_type,
        venue: evt.venue,
        location: evt.location,
        startDate: evt.start_date,
        endDate: evt.end_date,
        startTime: evt.start_time,
        endTime: evt.end_time,
        description: evt.description || '',
        status: evt.status as EventStatus,
        imageUrl: evt.image_url || undefined,
        qrCodeToken: evt.qr_code_token,
        createdAt: evt.created_at,
        updatedAt: evt.updated_at,
      };
    });
  },

  /**
   * Fetch single event with staffing requirements
   */
  async getEventById(eventId: string): Promise<EventItem | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(full_name),
        staffing_requirements(*)
      `)
      .eq('id', eventId)
      .maybeSingle();

    if (error || !data) return null;

    const org = data.organizer as unknown as { full_name: string } | null;
    const reqs = (data.staffing_requirements || []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      role: r.role,
      requiredQuantity: r.required_quantity,
      filledQuantity: r.filled_quantity,
      payAmount: Number(r.pay_amount),
      requiredSkills: r.required_skills || [],
      experienceRequired: r.experience_required || undefined,
      shiftStart: r.shift_start,
      shiftEnd: r.shift_end,
      description: r.description || '',
      status: r.status,
      createdAt: r.created_at,
    }));

    return {
      id: data.id,
      organizerId: data.organizer_id,
      organizerName: org?.full_name || 'Organizer',
      name: data.name,
      eventType: data.event_type,
      venue: data.venue,
      location: data.location,
      startDate: data.start_date,
      endDate: data.end_date,
      startTime: data.start_time,
      endTime: data.end_time,
      description: data.description || '',
      status: data.status as EventStatus,
      imageUrl: data.image_url || undefined,
      qrCodeToken: data.qr_code_token,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      requirements: reqs,
    };
  },

  /**
   * Create an event with optional initial staffing requirements
   */
  async createEvent(
    eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt' | 'organizerName'>,
    requirementsData?: Array<{
      role: string;
      requiredQuantity: number;
      payAmount: number;
      shiftStart: string;
      shiftEnd: string;
      requiredSkills: string[];
      description?: string;
    }>
  ): Promise<EventItem | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    let organizerId: string | null = isValidUUID(eventData.organizerId) ? eventData.organizerId : null;
    if (!organizerId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        organizerId = authData.user.id;
      } else {
        const { data: prof } = await client.from('profiles').select('id').eq('role', 'ORGANIZER').limit(1).maybeSingle();
        if (prof?.id) {
          organizerId = prof.id;
        } else {
          const { data: anyProf } = await client.from('profiles').select('id').limit(1).maybeSingle();
          organizerId = anyProf?.id || null;
        }
      }
    }

    if (!organizerId) {
      console.warn('Cannot create event in Supabase: no valid organizer profile UUID found. Please sign up or add an organizer profile.');
      return null;
    }

    const { data: event, error: evtError } = await client
      .from('events')
      .insert({
        organizer_id: organizerId,
        name: eventData.name,
        event_type: eventData.eventType,
        venue: eventData.venue,
        location: eventData.location,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        description: eventData.description,
        status: eventData.status,
        image_url: eventData.imageUrl || null,
        qr_code_token: eventData.qrCodeToken || `EVT-${Date.now()}`,
      })
      .select()
      .single();

    if (evtError || !event) return null;

    // If requirements provided, bulk insert
    if (requirementsData && requirementsData.length > 0) {
      await client.from('staffing_requirements').insert(
        requirementsData.map(r => ({
          event_id: event.id,
          role: r.role,
          required_quantity: r.requiredQuantity,
          filled_quantity: 0,
          pay_amount: r.payAmount,
          shift_start: r.shiftStart,
          shift_end: r.shiftEnd,
          required_skills: r.requiredSkills,
          description: r.description || '',
          status: 'PUBLISHED',
        }))
      );
    }

    return {
      id: event.id,
      organizerId: event.organizer_id,
      organizerName: 'Organizer',
      name: event.name,
      eventType: event.event_type,
      venue: event.venue,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      description: event.description || '',
      status: event.status as EventStatus,
      imageUrl: event.image_url || undefined,
      qrCodeToken: event.qr_code_token,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  },

  /**
   * Update event details
   */
  async updateEvent(eventId: string, updates: Partial<EventItem>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('events')
      .update({
        name: updates.name,
        event_type: updates.eventType,
        venue: updates.venue,
        location: updates.location,
        start_date: updates.startDate,
        end_date: updates.endDate,
        start_time: updates.startTime,
        end_time: updates.endTime,
        description: updates.description,
        status: updates.status,
        image_url: updates.imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    return !error;
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('events').delete().eq('id', eventId);
    return !error;
  },
};

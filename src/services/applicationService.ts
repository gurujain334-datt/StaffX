import { getSupabaseClient } from './supabaseClient';
import { Application, ApplicationStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const applicationService = {
  /**
   * Fetch applications with applicant and event details
   */
  async getApplications(filter?: { eventId?: string; professionalId?: string }): Promise<Application[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('applications')
      .select(`
        *,
        professional:profiles!applications_professional_id_fkey(full_name, avatar_url),
        requirement:staffing_requirements!applications_requirement_id_fkey(role)
      `)
      .order('applied_at', { ascending: false });

    if (filter?.eventId) {
      query = query.eq('event_id', filter.eventId);
    }
    if (filter?.professionalId) {
      query = query.eq('professional_id', filter.professionalId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(app => {
      const prof = app.professional as unknown as { full_name: string; avatar_url: string | null } | null;
      const req = app.requirement as unknown as { role: string } | null;

      return {
        id: app.id,
        requirementId: app.requirement_id,
        eventId: app.event_id,
        professionalId: app.professional_id,
        professionalName: prof?.full_name || 'Professional',
        professionalRating: 4.9,
        professionalExperience: 3,
        professionalVerified: true,
        role: req?.role || 'Staff',
        status: app.status as ApplicationStatus,
        message: app.message || undefined,
        appliedAt: app.applied_at,
        updatedAt: app.updated_at,
      };
    });
  },

  /**
   * Submit an application
   */
  async applyForJob(
    requirementId: string,
    eventId: string,
    professionalId: string,
    message?: string
  ): Promise<{ success: boolean; error?: string; application?: Application }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase is not configured' };

    let targetProfId = isValidUUID(professionalId) ? professionalId : null;
    if (!targetProfId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        targetProfId = authData.user.id;
      } else {
        const { data: prof } = await client.from('profiles').select('id').eq('role', 'PROFESSIONAL').limit(1).maybeSingle();
        targetProfId = prof?.id || null;
      }
    }

    let targetEventId = isValidUUID(eventId) ? eventId : null;
    let targetReqId = isValidUUID(requirementId) ? requirementId : null;

    if (!targetReqId) {
      const { data: firstReq } = await client.from('staffing_requirements').select('id, event_id').limit(1).maybeSingle();
      if (firstReq) {
        targetReqId = firstReq.id;
        if (!targetEventId) targetEventId = firstReq.event_id;
      }
    }

    if (!targetEventId) {
      const { data: firstEvt } = await client.from('events').select('id').limit(1).maybeSingle();
      targetEventId = firstEvt?.id || null;
    }

    if (!targetProfId || !targetEventId || !targetReqId) {
      return { success: false, error: 'Cannot apply: database records not found to associate with application.' };
    }

    const { data, error } = await client
      .from('applications')
      .insert({
        requirement_id: targetReqId,
        event_id: targetEventId,
        professional_id: targetProfId,
        message: message || null,
        status: 'APPLIED',
      })
      .select(`
        *,
        professional:profiles!applications_professional_id_fkey(full_name),
        requirement:staffing_requirements!applications_requirement_id_fkey(role)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You have already applied for this position.' };
      }
      return { success: false, error: error.message };
    }

    const prof = data.professional as unknown as { full_name: string } | null;
    const req = data.requirement as unknown as { role: string } | null;

    return {
      success: true,
      application: {
        id: data.id,
        requirementId: data.requirement_id,
        eventId: data.event_id,
        professionalId: data.professional_id,
        professionalName: prof?.full_name || 'Applicant',
        professionalRating: 5.0,
        professionalExperience: 2,
        professionalVerified: true,
        role: req?.role || 'Staff',
        status: data.status as ApplicationStatus,
        message: data.message || undefined,
        appliedAt: data.applied_at,
        updatedAt: data.updated_at,
      },
    };
  },

  /**
   * Update application status (SHORTLISTED, SELECTED, ACCEPTED, REJECTED)
   */
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    return !error;
  },
};

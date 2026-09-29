import { getSupabaseClient } from './supabaseClient';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const attendanceService = {
  /**
   * Fetch attendance records with related event and staff info
   */
  async getAttendance(filter?: { eventId?: string; professionalId?: string }): Promise<AttendanceRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('attendance_records')
      .select(`
        *,
        professional:profiles!attendance_records_professional_id_fkey(full_name),
        assignment:assignments!attendance_records_assignment_id_fkey(role)
      `)
      .order('created_at', { ascending: false });

    if (filter?.eventId) {
      query = query.eq('event_id', filter.eventId);
    }
    if (filter?.professionalId) {
      query = query.eq('professional_id', filter.professionalId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(att => {
      const prof = att.professional as unknown as { full_name: string } | null;
      const assign = att.assignment as unknown as { role: string } | null;

      return {
        id: att.id,
        assignmentId: att.assignment_id,
        eventId: att.event_id,
        professionalId: att.professional_id,
        professionalName: prof?.full_name || 'Staff',
        role: assign?.role || 'Staff Member',
        checkInAt: att.check_in_at || undefined,
        checkOutAt: att.check_out_at || undefined,
        status: att.status as AttendanceStatus,
        durationFormatted: att.duration_formatted || undefined,
        verificationMethod: att.verification_method || undefined,
      };
    });
  },

  /**
   * Record check-in by scanning event QR token
   */
  async recordCheckIn(
    qrToken: string,
    professionalId: string
  ): Promise<{ success: boolean; error?: string; record?: AttendanceRecord }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase client is not configured' };

    // 1. Find event by QR token
    const { data: event, error: eventErr } = await client
      .from('events')
      .select('id, name')
      .eq('qr_code_token', qrToken.trim())
      .maybeSingle();

    if (eventErr || !event) {
      return { success: false, error: 'Invalid or expired Event QR Code.' };
    }

    let targetProfId = isValidUUID(professionalId) ? professionalId : null;
    if (!targetProfId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        targetProfId = authData.user.id;
      } else {
        const { data: proProf } = await client.from('profiles').select('id').eq('role', 'PROFESSIONAL').limit(1).maybeSingle();
        targetProfId = proProf?.id || null;
      }
    }

    if (!targetProfId) {
      return { success: false, error: 'Valid professional profile required for check-in.' };
    }

    // 2. Find confirmed assignment for this user and event
    let { data: assignment, error: assignErr } = await client
      .from('assignments')
      .select('*')
      .eq('event_id', event.id)
      .eq('professional_id', targetProfId)
      .eq('status', 'CONFIRMED')
      .maybeSingle();

    // If no specific assignment, find any assignment for this event
    if (!assignment) {
      const { data: anyAssign } = await client
        .from('assignments')
        .select('*')
        .eq('event_id', event.id)
        .limit(1)
        .maybeSingle();
      if (anyAssign) {
        assignment = anyAssign;
      }
    }

    if (!assignment) {
      return { success: false, error: 'No confirmed assignment found for you at this event.' };
    }

    // 3. Update attendance record
    const nowIso = new Date().toISOString();
    const { data: updated, error: updateErr } = await client
      .from('attendance_records')
      .update({
        check_in_at: nowIso,
        status: 'CHECKED_IN',
        verification_method: 'QR_SCAN',
        updated_at: nowIso,
      })
      .eq('assignment_id', assignment.id)
      .select(`
        *,
        professional:profiles!attendance_records_professional_id_fkey(full_name)
      `)
      .single();

    if (updateErr || !updated) {
      return { success: false, error: updateErr?.message || 'Failed to record check-in' };
    }

    const prof = updated.professional as unknown as { full_name: string } | null;

    return {
      success: true,
      record: {
        id: updated.id,
        assignmentId: updated.assignment_id,
        eventId: updated.event_id,
        professionalId: updated.professional_id,
        professionalName: prof?.full_name || 'Staff',
        role: assignment.role,
        checkInAt: updated.check_in_at || undefined,
        checkOutAt: updated.check_out_at || undefined,
        status: updated.status as AttendanceStatus,
        durationFormatted: updated.duration_formatted || undefined,
        verificationMethod: 'QR_SCAN',
      },
    };
  },

  /**
   * Record checkout
   */
  async recordCheckOut(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase client is not configured' };

    const { data: existing } = await client
      .from('attendance_records')
      .select('*')
      .eq('assignment_id', assignmentId)
      .maybeSingle();

    if (!existing || !existing.check_in_at) {
      return { success: false, error: 'No active check-in record found to check out.' };
    }

    const now = new Date();
    const checkInDate = new Date(existing.check_in_at);
    const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    const durationFormatted = `${hours} hrs`;

    const { error } = await client
      .from('attendance_records')
      .update({
        check_out_at: now.toISOString(),
        status: 'CHECKED_OUT',
        duration_formatted: durationFormatted,
        updated_at: now.toISOString(),
      })
      .eq('assignment_id', assignmentId);

    return { success: !error, error: error?.message };
  },

  /**
   * Manual Attendance override by Organizer or Admin
   */
  async manualOverride(recordId: string, status: AttendanceStatus): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('attendance_records')
      .update({
        status,
        verification_method: 'MANUAL_OVERRIDE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    return !error;
  },
};

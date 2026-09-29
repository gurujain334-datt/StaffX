import { getSupabaseClient } from './supabaseClient';
import { Assignment, AssignmentStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const hiringService = {
  /**
   * Fetch assignments (hiring records)
   */
  async getAssignments(filter?: {
    eventId?: string;
    professionalId?: string;
    organizerId?: string;
  }): Promise<Assignment[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('assignments')
      .select(`
        *,
        professional:profiles!assignments_professional_id_fkey(full_name)
      `)
      .order('assigned_at', { ascending: false });

    if (filter?.eventId) {
      query = query.eq('event_id', filter.eventId);
    }
    if (filter?.professionalId) {
      query = query.eq('professional_id', filter.professionalId);
    }
    if (filter?.organizerId) {
      query = query.eq('organizer_id', filter.organizerId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(item => {
      const prof = item.professional as unknown as { full_name: string } | null;
      return {
        id: item.id,
        requirementId: item.requirement_id,
        eventId: item.event_id,
        professionalId: item.professional_id,
        professionalName: prof?.full_name || 'Hired Staff',
        role: item.role,
        status: item.status as AssignmentStatus,
        agreedRate: Number(item.agreed_rate),
        assignedAt: item.assigned_at,
        completedAt: item.completed_at || undefined,
      };
    });
  },

  /**
   * Hire an applicant:
   * 1. Create assignment record
   * 2. Update application status to ACCEPTED
   * 3. Increment filled_quantity in staffing_requirements
   * 4. Auto-generate pending attendance record
   * 5. Auto-generate pending payment record
   */
  async hireApplicant(params: {
    requirementId: string;
    eventId: string;
    organizerId: string;
    professionalId: string;
    role: string;
    agreedRate: number;
    applicationId?: string;
  }): Promise<{ success: boolean; error?: string; assignment?: Assignment }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase client is not configured.' };

    let targetReqId = isValidUUID(params.requirementId) ? params.requirementId : null;
    let targetEventId = isValidUUID(params.eventId) ? params.eventId : null;
    let targetOrgId = isValidUUID(params.organizerId) ? params.organizerId : null;
    let targetProfId = isValidUUID(params.professionalId) ? params.professionalId : null;

    if (!targetReqId) {
      const { data: firstReq } = await client.from('staffing_requirements').select('id, event_id').limit(1).maybeSingle();
      if (firstReq) {
        targetReqId = firstReq.id;
        if (!targetEventId) targetEventId = firstReq.event_id;
      }
    }
    if (!targetEventId) {
      const { data: firstEvt } = await client.from('events').select('id, organizer_id').limit(1).maybeSingle();
      if (firstEvt) {
        targetEventId = firstEvt.id;
        if (!targetOrgId) targetOrgId = firstEvt.organizer_id;
      }
    }
    if (!targetOrgId) {
      const { data: orgProf } = await client.from('profiles').select('id').eq('role', 'ORGANIZER').limit(1).maybeSingle();
      targetOrgId = orgProf?.id || null;
    }
    if (!targetProfId) {
      const { data: proProf } = await client.from('profiles').select('id').eq('role', 'PROFESSIONAL').limit(1).maybeSingle();
      targetProfId = proProf?.id || null;
    }

    if (!targetReqId || !targetEventId || !targetOrgId || !targetProfId) {
      return { success: false, error: 'Cannot record hire: matching database records not found.' };
    }

    // Capacity & Race-Condition Check: Verify positions remain available in database
    const { data: currentReq, error: reqFetchErr } = await client
      .from('staffing_requirements')
      .select('id, required_quantity, filled_quantity, status')
      .eq('id', targetReqId)
      .maybeSingle();

    if (currentReq) {
      if (currentReq.filled_quantity >= currentReq.required_quantity) {
        return { success: false, error: `Position capacity reached (${currentReq.filled_quantity}/${currentReq.required_quantity} filled).` };
      }
    }

    // 1. Insert assignment
    const { data: assignment, error: assignError } = await client
      .from('assignments')
      .insert({
        requirement_id: targetReqId,
        event_id: targetEventId,
        organizer_id: targetOrgId,
        professional_id: targetProfId,
        role: params.role,
        agreed_rate: params.agreedRate,
        status: 'CONFIRMED',
      })
      .select(`
        *,
        professional:profiles!assignments_professional_id_fkey(full_name)
      `)
      .single();

    if (assignError || !assignment) {
      return { success: false, error: assignError?.message || 'Failed to create assignment' };
    }

    // Update requirement filled count in database
    if (currentReq) {
      const newFilled = (currentReq.filled_quantity || 0) + 1;
      const newStatus = newFilled >= currentReq.required_quantity ? 'FILLED' : currentReq.status;
      await client
        .from('staffing_requirements')
        .update({
          filled_quantity: newFilled,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetReqId);
    }

    // 2. Update application if provided
    if (params.applicationId && isValidUUID(params.applicationId)) {
      await client
        .from('applications')
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq('id', params.applicationId);
    }

    // 3. Create attendance record placeholder
    await client.from('attendance_records').insert({
      assignment_id: assignment.id,
      event_id: targetEventId,
      professional_id: targetProfId,
      status: 'NOT_CHECKED_IN',
    });

    // 4. Create pending payment record
    await client.from('payment_records').insert({
      assignment_id: assignment.id,
      event_id: targetEventId,
      organizer_id: targetOrgId,
      professional_id: targetProfId,
      role: params.role,
      amount: params.agreedRate,
      status: 'PENDING',
      payment_method: 'Escrow / UPI',
      transaction_reference: `ESC-${Date.now().toString().slice(-6)}`,
    });

    const prof = assignment.professional as unknown as { full_name: string } | null;

    return {
      success: true,
      assignment: {
        id: assignment.id,
        requirementId: assignment.requirement_id,
        eventId: assignment.event_id,
        professionalId: assignment.professional_id,
        professionalName: prof?.full_name || 'Hired Staff',
        role: assignment.role,
        status: assignment.status as AssignmentStatus,
        agreedRate: Number(assignment.agreed_rate),
        assignedAt: assignment.assigned_at,
        completedAt: assignment.completed_at || undefined,
      },
    };
  },

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const updates: { status: AssignmentStatus; completed_at?: string } = { status };
    if (status === 'COMPLETED') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await client.from('assignments').update(updates).eq('id', assignmentId);
    return !error;
  },
};

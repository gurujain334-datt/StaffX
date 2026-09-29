import { getSupabaseClient } from './supabaseClient';
import { StaffingRequirement, RequirementStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const staffingService = {
  /**
   * Fetch staffing requirements (optionally filtered by eventId)
   */
  async getRequirements(eventId?: string): Promise<StaffingRequirement[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client.from('staffing_requirements').select('*').order('created_at', { ascending: false });
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(r => ({
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
      status: r.status as RequirementStatus,
      createdAt: r.created_at,
    }));
  },

  /**
   * Create a staffing requirement
   */
  async createRequirement(
    requirementData: Omit<StaffingRequirement, 'id' | 'createdAt' | 'filledQuantity'>
  ): Promise<StaffingRequirement | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    let targetEventId: string | null = isValidUUID(requirementData.eventId) ? requirementData.eventId : null;
    if (!targetEventId) {
      const { data: firstEvt } = await client.from('events').select('id').limit(1).maybeSingle();
      targetEventId = firstEvt?.id || null;
    }

    if (!targetEventId) {
      console.warn('Cannot create requirement in Supabase: no event UUID found in database.');
      return null;
    }

    const { data, error } = await client
      .from('staffing_requirements')
      .insert({
        event_id: targetEventId,
        role: requirementData.role,
        required_quantity: requirementData.requiredQuantity,
        filled_quantity: 0,
        pay_amount: requirementData.payAmount,
        required_skills: requirementData.requiredSkills,
        experience_required: requirementData.experienceRequired,
        shift_start: requirementData.shiftStart,
        shift_end: requirementData.shiftEnd,
        description: requirementData.description,
        status: requirementData.status || 'PUBLISHED',
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      eventId: data.event_id,
      role: data.role,
      requiredQuantity: data.required_quantity,
      filledQuantity: data.filled_quantity,
      payAmount: Number(data.pay_amount),
      requiredSkills: data.required_skills || [],
      experienceRequired: data.experience_required || undefined,
      shiftStart: data.shift_start,
      shiftEnd: data.shift_end,
      description: data.description || '',
      status: data.status as RequirementStatus,
      createdAt: data.created_at,
    };
  },

  /**
   * Update a staffing requirement
   */
  async updateRequirement(id: string, updates: Partial<StaffingRequirement>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('staffing_requirements')
      .update({
        role: updates.role,
        required_quantity: updates.requiredQuantity,
        filled_quantity: updates.filledQuantity,
        pay_amount: updates.payAmount,
        required_skills: updates.requiredSkills,
        experience_required: updates.experienceRequired,
        shift_start: updates.shiftStart,
        shift_end: updates.shiftEnd,
        description: updates.description,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  },

  /**
   * Delete requirement
   */
  async deleteRequirement(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('staffing_requirements').delete().eq('id', id);
    return !error;
  },
};

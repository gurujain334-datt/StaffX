import { getSupabaseClient } from './supabaseClient';
import { PaymentRecord, PaymentStatus } from '../types';

export const paymentService = {
  /**
   * Fetch payment records
   */
  async getPayments(filter?: { organizerId?: string; professionalId?: string }): Promise<PaymentRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('payment_records')
      .select(`
        *,
        event:events!payment_records_event_id_fkey(name),
        professional:profiles!payment_records_professional_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (filter?.organizerId) {
      query = query.eq('organizer_id', filter.organizerId);
    }
    if (filter?.professionalId) {
      query = query.eq('professional_id', filter.professionalId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(pay => {
      const evt = pay.event as unknown as { name: string } | null;
      const prof = pay.professional as unknown as { full_name: string } | null;

      return {
        id: pay.id,
        assignmentId: pay.assignment_id || '',
        eventId: pay.event_id,
        eventName: evt?.name || 'Event Assignment',
        organizerId: pay.organizer_id,
        professionalId: pay.professional_id,
        professionalName: prof?.full_name || 'Staff Member',
        role: pay.role,
        amount: Number(pay.amount),
        status: pay.status as PaymentStatus,
        paymentMethod: pay.payment_method || undefined,
        transactionReference: pay.transaction_reference || undefined,
        paidAt: pay.paid_at || undefined,
        createdAt: pay.created_at,
        updatedAt: pay.updated_at,
      };
    });
  },

  /**
   * Update payment status (e.g. APPROVED, PAID)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    paymentMethod?: string,
    transactionReference?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const updates: {
      status: PaymentStatus;
      paid_at?: string;
      payment_method?: string;
      transaction_reference?: string;
      updated_at: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'PAID') {
      updates.paid_at = new Date().toISOString();
      if (paymentMethod) updates.payment_method = paymentMethod;
      if (transactionReference) updates.transaction_reference = transactionReference;
    }

    const { error } = await client.from('payment_records').update(updates).eq('id', paymentId);
    return !error;
  },
};

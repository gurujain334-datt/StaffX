import { getSupabaseClient } from './supabaseClient';
import { NotificationItem } from '../types';

export const notificationService = {
  /**
   * Fetch user notifications
   */
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('recipient_id', userId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(item => ({
      id: item.id,
      recipientId: item.recipient_id,
      type: item.type || 'SYSTEM',
      title: item.title,
      message: item.message,
      readStatus: item.read_status ?? item.is_read ?? false,
      createdAt: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    }));
  },

  /**
   * Create a notification record in Supabase
   */
  async createNotification(params: {
    recipientId: string;
    type: 'APPLICATION' | 'SHORTLIST' | 'HIRING' | 'ATTENDANCE' | 'PAYMENT' | 'SYSTEM';
    title: string;
    message: string;
  }): Promise<NotificationItem | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('notifications')
      .insert({
        recipient_id: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        read_status: false,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Failed to insert notification into database:', error?.message);
      return null;
    }

    return {
      id: data.id,
      recipientId: data.recipient_id,
      type: data.type,
      title: data.title,
      message: data.message,
      readStatus: false,
      createdAt: 'Just now',
    };
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('notifications')
      .update({ read_status: true, is_read: true })
      .eq('id', notificationId);

    return !error;
  },

  /**
   * Mark all notifications as read for a given user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client
      .from('notifications')
      .update({ read_status: true, is_read: true })
      .eq('recipient_id', userId);

    return !error;
  },
};

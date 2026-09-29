import { useEffect } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';

export interface RealtimeHandlers {
  onApplicationChange?: () => void;
  onStaffingRequirementChange?: () => void;
  onAssignmentChange?: () => void;
  onNotificationChange?: () => void;
}

export function useSupabaseRealtime(handlers: RealtimeHandlers) {
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client.channel('eventflex-realtime-channel');

    if (handlers.onApplicationChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          handlers.onApplicationChange?.();
        }
      );
    }

    if (handlers.onStaffingRequirementChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staffing_requirements' },
        () => {
          handlers.onStaffingRequirementChange?.();
        }
      );
    }

    if (handlers.onAssignmentChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        () => {
          handlers.onAssignmentChange?.();
        }
      );
    }

    if (handlers.onNotificationChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          handlers.onNotificationChange?.();
        }
      );
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connected to Realtime stream
      }
    });

    return () => {
      client.removeChannel(channel);
    };
  }, [handlers]);
}

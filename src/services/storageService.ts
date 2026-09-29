import { getSupabaseClient } from './supabaseClient';

export const storageService = {
  /**
   * Upload user avatar image to 'avatars' bucket
   */
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { url: null, error: 'Supabase is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data } = client.storage.from('avatars').getPublicUrl(fileName);
      return { url: data.publicUrl };
    } catch (err: unknown) {
      return { url: null, error: err instanceof Error ? err.message : 'Upload failed' };
    }
  },

  /**
   * Upload event cover banner to 'event-covers' bucket
   */
  async uploadEventCover(
    eventId: string,
    file: File
  ): Promise<{ url: string | null; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { url: null, error: 'Supabase is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from('event-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data } = client.storage.from('event-covers').getPublicUrl(fileName);
      return { url: data.publicUrl };
    } catch (err: unknown) {
      return { url: null, error: err instanceof Error ? err.message : 'Upload failed' };
    }
  },

  /**
   * Upload professional verification document (ID / Certificate) to private bucket
   */
  async uploadVerificationDoc(
    userId: string,
    file: File
  ): Promise<{ path: string | null; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { path: null, error: 'Supabase is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/docs/${Date.now()}.${fileExt}`;

      const { error } = await client.storage
        .from('verification-docs')
        .upload(filePath, file, {
          upsert: true,
        });

      if (error) {
        return { path: null, error: error.message };
      }

      return { path: filePath };
    } catch (err: unknown) {
      return { path: null, error: err instanceof Error ? err.message : 'Doc upload failed' };
    }
  },
};

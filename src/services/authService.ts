import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { UserRole, User } from '../types';
import { toValidUUID } from './uuidHelper';

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export const authService = {
  /**
   * Register a new user with email, password, and metadata
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    extraMetadata: Record<string, unknown> = {}
  ): Promise<AuthResponse> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        user: null,
        error: 'Supabase client is not configured.',
      };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            ...extraMetadata,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration succeeded, but no user returned.' };
      }

      // Persist profile into public.profiles
      try {
        await client.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email || email,
          phone: (extraMetadata.phone as string) || null,
          full_name: fullName,
          role: role,
          location: (extraMetadata.location as string) || 'Bhopal',
          status: 'ACTIVE',
        });

        // Persist role-specific profile
        if (role === 'ORGANIZER') {
          await client.from('organizer_profiles').upsert({
            user_id: data.user.id,
            organization_name: (extraMetadata.organization_name as string) || `${fullName}'s Events`,
            organization_type: (extraMetadata.organization_type as string) || 'Corporate & Social Events',
            description: (extraMetadata.description as string) || '',
            location: (extraMetadata.location as string) || 'Bhopal',
            website: (extraMetadata.website as string) || null,
            completed_events_count: 0,
            rating: 5.0,
            verification_status: 'PENDING',
          }, { onConflict: 'user_id' });
        } else if (role === 'PROFESSIONAL') {
          const primaryCat = (extraMetadata.primary_category as string) || 'Security Guard';
          const skillsList = Array.isArray(extraMetadata.skills) && extraMetadata.skills.length > 0
            ? extraMetadata.skills
            : [primaryCat];
          await client.from('professional_profiles').upsert({
            user_id: data.user.id,
            skills: skillsList,
            primary_category: primaryCat,
            experience_years: Number(extraMetadata.experience_years) || 1,
            location: (extraMetadata.location as string) || 'Bhopal',
            availability: 'Available',
            hourly_rate: Number(extraMetadata.hourly_rate) || 250,
            rating: 5.0,
            completed_jobs_count: 0,
            verification_status: 'PENDING',
            bio: (extraMetadata.bio as string) || '',
            phone: (extraMetadata.phone as string) || null,
          }, { onConflict: 'user_id' });
        }
      } catch (dbErr) {
        console.warn('Profile table insert warning:', dbErr);
      }

      const formattedUser: User = {
        id: data.user.id,
        email: data.user.email || email,
        phone: (extraMetadata.phone as string) || '',
        role: role,
        fullName: fullName,
        status: 'ACTIVE',
        createdAt: data.user.created_at,
        updatedAt: data.user.created_at,
      };

      return { user: formattedUser };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up error';
      return { user: null, error: msg };
    }
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: 'Supabase client is not configured.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let friendlyMessage = error.message;
        const lower = error.message.toLowerCase();
        if (lower.includes('invalid login credentials')) {
          friendlyMessage = 'Invalid email or password. Please verify your credentials and try again.';
        } else if (lower.includes('email not confirmed')) {
          friendlyMessage = 'Email address has not been confirmed yet. Please verify your email inbox or check Supabase settings.';
        } else if (lower.includes('user not found') || lower.includes('no user')) {
          friendlyMessage = 'No registered account found with this email. Please check your spelling or register for a new account.';
        }
        return { user: null, error: friendlyMessage };
      }

      if (!data.user) {
        return { user: null, error: 'Sign in succeeded, but no session created.' };
      }

      // Fetch profile from public.profiles
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const userRole = (profile?.role || data.user.user_metadata?.role || 'ORGANIZER') as UserRole;
      const userName = profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0];

      // Auto self-heal profile if missing
      if (!profile) {
        client.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: userName,
          role: userRole,
          status: 'ACTIVE',
        }).then(
          () => {},
          e => console.warn('Self-heal profile error:', e)
        );
      }

      const formattedUser: User = {
        id: data.user.id,
        email: data.user.email || email,
        phone: profile?.phone || '',
        role: userRole,
        fullName: userName,
        avatarUrl: profile?.avatar_url || undefined,
        status: profile?.status || 'ACTIVE',
        createdAt: data.user.created_at,
        updatedAt: profile?.updated_at || data.user.created_at,
      };

      return { user: formattedUser };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      return { user: null, error: msg };
    }
  },

  /**
   * Log out the current session
   */
  async signOut(): Promise<{ error?: string }> {
    const client = getSupabaseClient();
    if (!client) return {};

    try {
      const { error } = await client.auth.signOut();
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign out error' };
    }
  },

  /**
   * Retrieve the current authenticated user and profile
   */
  async getCurrentUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) return null;

      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      const role = (profile?.role || authData.user.user_metadata?.role || 'ORGANIZER') as UserRole;

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        phone: profile?.phone || '',
        role: role,
        fullName: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
        avatarUrl: profile?.avatar_url || undefined,
        status: profile?.status || 'ACTIVE',
        createdAt: authData.user.created_at,
        updatedAt: profile?.updated_at || authData.user.created_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const client = getSupabaseClient();
    if (!client) return { unsubscribe: () => {} };

    const { data: sub } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });

    return {
      unsubscribe: () => {
        sub.subscription.unsubscribe();
      },
    };
  },

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<{ error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase client is not configured.' };

    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to reset password' };
    }
  },

  /**
   * Directly sync/upsert user profile into Supabase public.profiles table
   * ensuring immediate reflection in the Supabase Dashboard
   */
  async syncProfileToSupabase(user: User, extraMetadata?: Record<string, unknown>): Promise<User> {
    const client = getSupabaseClient();
    if (!client) return user;

    try {
      const validUuid = toValidUUID(user.id || user.email);
      const syncedUser: User = { ...user, id: validUuid };

      // 1. Upsert into public.profiles
      const { error: profErr } = await client.from('profiles').upsert({
        id: validUuid,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        full_name: user.fullName,
        role: user.role,
        location: (extraMetadata?.location as string) || 'Bhopal',
        status: user.status || 'ACTIVE',
        avatar_url: user.avatarUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (profErr) {
        console.warn('Supabase profiles upsert notice:', profErr.message);
      }

      // 2. Upsert into organizer_profiles or professional_profiles
      if (user.role === 'ORGANIZER') {
        await client.from('organizer_profiles').upsert({
          user_id: validUuid,
          organization_name: (extraMetadata?.organization_name as string) || `${user.fullName}'s Events`,
          organization_type: (extraMetadata?.organization_type as string) || 'Corporate & Social Events',
          description: (extraMetadata?.description as string) || 'Premier event organizer on StaffX.',
          location: (extraMetadata?.location as string) || 'Bhopal',
          website: (extraMetadata?.website as string) || null,
          completed_events_count: 0,
          rating: 5.0,
          verification_status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      } else if (user.role === 'PROFESSIONAL') {
        const primaryCat = (extraMetadata?.primary_category as string) || 'Security Guard';
        const skillsList = Array.isArray(extraMetadata?.skills) && extraMetadata.skills.length > 0
          ? extraMetadata.skills
          : ['Event Safety', 'VIP Management', 'Security'];
        await client.from('professional_profiles').upsert({
          user_id: validUuid,
          skills: skillsList,
          primary_category: primaryCat,
          experience_years: Number(extraMetadata?.experience_years) || 3,
          location: (extraMetadata?.location as string) || 'Bhopal',
          availability: 'Available',
          hourly_rate: Number(extraMetadata?.hourly_rate) || 250,
          rating: 5.0,
          completed_jobs_count: 0,
          verification_status: 'VERIFIED',
          bio: (extraMetadata?.bio as string) || `${user.fullName} - StaffX Professional Crew Member`,
          phone: user.phone || '+91 98765 43210',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }

      return syncedUser;
    } catch (err) {
      console.warn('Sync profile to Supabase exception:', err);
      return user;
    }
  },

  /**
   * Search Supabase profiles table for a matching email or name
   */
  async findProfileByQuery(queryStr: string): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client || !queryStr) return null;

    const term = queryStr.trim().toLowerCase();
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${term}%,full_name.ilike.%${term}%,id.eq.${term}`)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        phone: data.phone || '',
        role: (data.role || 'ORGANIZER') as UserRole,
        fullName: data.full_name || 'User',
        avatarUrl: data.avatar_url || undefined,
        status: data.status || 'ACTIVE',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },
};

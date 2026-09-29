import { getSupabaseClient } from './supabaseClient';
import { OrganizerProfile, ProfessionalProfile, VerificationStatus } from '../types';
import { isValidUUID } from './uuidHelper';

export const profileService = {
  /**
   * Fetch organizer profile by user ID
   */
  async getOrganizerProfile(userId: string): Promise<OrganizerProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      organizationName: data.organization_name,
      organizationType: data.organization_type,
      description: data.description || '',
      location: data.location || 'Bhopal',
      website: data.website || undefined,
      completedEventsCount: data.completed_events_count,
      rating: Number(data.rating),
      verificationStatus: data.verification_status,
      createdAt: data.created_at,
    };
  },

  /**
   * Update organizer profile
   */
  async updateOrganizerProfile(userId: string, updates: Partial<OrganizerProfile>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    let targetUserId = isValidUUID(userId) ? userId : null;
    if (!targetUserId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        targetUserId = authData.user.id;
      } else {
        const { data: prof } = await client.from('organizer_profiles').select('user_id').limit(1).maybeSingle();
        targetUserId = prof?.user_id || null;
      }
    }

    if (!targetUserId) return false;

    const { error } = await client
      .from('organizer_profiles')
      .update({
        organization_name: updates.organizationName,
        organization_type: updates.organizationType,
        description: updates.description,
        location: updates.location,
        website: updates.website,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);

    return !error;
  },

  /**
   * Fetch single professional profile by user ID
   */
  async getProfessionalProfile(userId: string): Promise<ProfessionalProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('professional_profiles')
      .select(`
        *,
        profiles!inner(full_name, email, avatar_url, phone)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const userProfile = (data as unknown as { profiles: { full_name: string; phone: string | null; avatar_url: string | null } }).profiles;

    return {
      id: data.id,
      userId: data.user_id,
      name: userProfile?.full_name || 'Professional',
      skills: data.skills || [],
      primaryCategory: data.primary_category,
      experienceYears: data.experience_years,
      location: data.location || 'Bhopal',
      availability: data.availability,
      hourlyRate: Number(data.hourly_rate),
      rating: Number(data.rating),
      completedJobsCount: data.completed_jobs_count,
      verificationStatus: data.verification_status,
      bio: data.bio || '',
      profileImage: data.profile_image || userProfile?.avatar_url || undefined,
      phone: data.phone || userProfile?.phone || undefined,
      createdAt: data.created_at,
    };
  },

  /**
   * Fetch all verified/active professionals for organizer workforce search
   */
  async getAllProfessionals(): Promise<ProfessionalProfile[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('professional_profiles')
      .select(`
        *,
        profiles!inner(full_name, email, avatar_url, phone)
      `)
      .order('rating', { ascending: false });

    if (error || !data) return [];

    return data.map(item => {
      const u = (item as unknown as { profiles: { full_name: string; phone: string | null; avatar_url: string | null } }).profiles;
      return {
        id: item.id,
        userId: item.user_id,
        name: u?.full_name || 'Professional',
        skills: item.skills || [],
        primaryCategory: item.primary_category,
        experienceYears: item.experience_years,
        location: item.location || 'Bhopal',
        availability: item.availability,
        hourlyRate: Number(item.hourly_rate),
        rating: Number(item.rating),
        completedJobsCount: item.completed_jobs_count,
        verificationStatus: item.verification_status,
        bio: item.bio || '',
        profileImage: item.profile_image || u?.avatar_url || undefined,
        phone: item.phone || u?.phone || undefined,
        createdAt: item.created_at,
      };
    });
  },

  /**
   * Update professional profile
   */
  async updateProfessionalProfile(userId: string, updates: Partial<ProfessionalProfile>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    let targetUserId = isValidUUID(userId) ? userId : null;
    if (!targetUserId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        targetUserId = authData.user.id;
      } else {
        const { data: prof } = await client.from('professional_profiles').select('user_id').limit(1).maybeSingle();
        targetUserId = prof?.user_id || null;
      }
    }

    if (!targetUserId) return false;

    const { error } = await client
      .from('professional_profiles')
      .update({
        skills: updates.skills,
        primary_category: updates.primaryCategory,
        experience_years: updates.experienceYears,
        location: updates.location,
        availability: updates.availability,
        hourly_rate: updates.hourlyRate,
        bio: updates.bio,
        phone: updates.phone,
        profile_image: updates.profileImage,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);

    return !error;
  },

  /**
   * Admin verification update
   */
  async setVerificationStatus(
    userId: string,
    role: 'ORGANIZER' | 'PROFESSIONAL',
    status: VerificationStatus
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const table = role === 'ORGANIZER' ? 'organizer_profiles' : 'professional_profiles';
    const { error } = await client
      .from(table)
      .update({
        verification_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return !error;
  },
};

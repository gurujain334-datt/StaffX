import { getSupabaseClient } from './supabaseClient';
import { Review, UserRole } from '../types';
import { isValidUUID } from './uuidHelper';

export const reviewService = {
  /**
   * Fetch reviews
   */
  async getReviews(reviewedUserId?: string): Promise<Review[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    let query = client
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (reviewedUserId) {
      query = query.eq('reviewed_user_id', reviewedUserId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(rev => {
      const r = rev.reviewer as unknown as { full_name: string; role: string } | null;
      return {
        id: rev.id,
        assignmentId: rev.assignment_id || '',
        reviewerId: rev.reviewer_id,
        reviewerName: r?.full_name || 'Reviewer',
        reviewerRole: (r?.role || rev.reviewer_role) as UserRole,
        reviewedUserId: rev.reviewed_user_id,
        rating: Number(rev.rating),
        comment: rev.comment,
        createdAt: rev.created_at,
      };
    });
  },

  /**
   * Create a review
   */
  async createReview(review: {
    assignmentId?: string;
    reviewerId: string;
    reviewerRole: UserRole;
    reviewedUserId: string;
    rating: number;
    comment: string;
  }): Promise<Review | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    let targetReviewerId = isValidUUID(review.reviewerId) ? review.reviewerId : null;
    let targetReviewedId = isValidUUID(review.reviewedUserId) ? review.reviewedUserId : null;

    if (!targetReviewerId) {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id && isValidUUID(authData.user.id)) {
        targetReviewerId = authData.user.id;
      } else {
        const { data: prof } = await client.from('profiles').select('id').limit(1).maybeSingle();
        targetReviewerId = prof?.id || null;
      }
    }

    if (!targetReviewedId) {
      const { data: otherProf } = await client.from('profiles').select('id').neq('id', targetReviewerId || '').limit(1).maybeSingle();
      targetReviewedId = otherProf?.id || targetReviewerId;
    }

    if (!targetReviewerId || !targetReviewedId) {
      return null;
    }

    const targetAssignmentId = review.assignmentId && isValidUUID(review.assignmentId) ? review.assignmentId : null;

    const { data, error } = await client
      .from('reviews')
      .insert({
        assignment_id: targetAssignmentId,
        reviewer_id: targetReviewerId,
        reviewer_role: review.reviewerRole,
        reviewed_user_id: targetReviewedId,
        rating: review.rating,
        comment: review.comment,
      })
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(full_name)
      `)
      .single();

    if (error || !data) return null;

    const r = data.reviewer as unknown as { full_name: string } | null;

    return {
      id: data.id,
      assignmentId: data.assignment_id || '',
      reviewerId: data.reviewer_id,
      reviewerName: r?.full_name || 'Reviewer',
      reviewerRole: data.reviewer_role as UserRole,
      reviewedUserId: data.reviewed_user_id,
      rating: Number(data.rating),
      comment: data.comment,
      createdAt: data.created_at,
    };
  },
};

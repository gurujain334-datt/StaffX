import { StaffingRequirement, ProfessionalProfile, Application, Event, SmartMatchResult } from '../types';
import { calculateMatchScore } from '../lib/matching';

export interface GeneratedRolePlan {
  role: string;
  workers_required: number;
  skills: string[];
  responsibilities: string[];
  suggested_payment: number;
  shift_start?: string;
  shift_end?: string;
  notes?: string;
}

export interface AIRankingResult {
  applicationId: string;
  matchScore: number;
  explanation: string;
  keyReasons: string[];
}

export interface AIJobRecommendation {
  requirementId: string;
  matchScore: number;
  explanation: string;
}

export interface AIBioResult {
  bio: string;
  suggestedSkills: string[];
  summary: string;
}

export const aiService = {
  /**
   * 1. Generate Staffing Plan
   */
  async generateStaffingPlan(params: {
    eventName: string;
    description?: string;
    guestCount?: number;
    location?: string;
    eventType?: string;
    shiftStart?: string;
    shiftEnd?: string;
  }): Promise<{ plan: GeneratedRolePlan[]; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/generate-staffing-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.plan) && data.plan.length > 0) {
        return { plan: data.plan, isFallback: false };
      }
    } catch (err) {
      console.warn('AI staffing plan generation error, using fallback strategy:', err);
    }

    // Fallback algorithmic recommendation
    const guests = params.guestCount || 300;
    const fallbackRoles: GeneratedRolePlan[] = [
      {
        role: 'Security Guard',
        workers_required: Math.max(2, Math.ceil(guests / 80)),
        skills: ['Crowd Management', 'Security Monitoring', 'Emergency Response'],
        responsibilities: ['Entrance verification', 'Crowd control', 'Guest safety monitoring'],
        suggested_payment: 1800,
        shift_start: params.shiftStart || '17:00',
        shift_end: params.shiftEnd || '23:00',
        notes: 'Position at main gates, VIP zone, and exit perimeter.',
      },
      {
        role: 'Waiter',
        workers_required: Math.max(4, Math.ceil(guests / 35)),
        skills: ['Hospitality', 'Customer Service', 'Food & Beverage Service'],
        responsibilities: ['Table service', 'Guest refreshment distribution', 'Hall maintenance'],
        suggested_payment: 1500,
        shift_start: params.shiftStart || '17:00',
        shift_end: params.shiftEnd || '23:00',
        notes: 'Assign dedicated tables and buffet stations.',
      },
      {
        role: 'Event Coordinator',
        workers_required: Math.max(1, Math.ceil(guests / 200)),
        skills: ['Event Operations', 'Team Supervision', 'Communication'],
        responsibilities: ['Schedule oversight', 'Vendor coordination', 'Staff Briefings'],
        suggested_payment: 2500,
        shift_start: params.shiftStart || '17:00',
        shift_end: params.shiftEnd || '23:00',
        notes: 'Oversee overall schedule and team communications.',
      },
      {
        role: 'Registration Agent',
        workers_required: Math.max(2, Math.ceil(guests / 150)),
        skills: ['Guest Desk', 'QR Scanning', 'Ticketing'],
        responsibilities: ['Badge issue', 'QR Check-in', 'Information desk'],
        suggested_payment: 1400,
        shift_start: params.shiftStart || '17:00',
        shift_end: params.shiftEnd || '23:00',
        notes: 'Desk near main foyer entry.',
      },
    ];

    return { plan: fallbackRoles, isFallback: true };
  },

  /**
   * 2. Match Candidates for a Requirement
   */
  async matchCandidates(
    requirement: StaffingRequirement,
    candidates: ProfessionalProfile[],
    eventLocation: string
  ): Promise<{ matches: SmartMatchResult[]; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/match-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, candidates, eventLocation }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.matches)) {
          const matchMap = new Map<string, any>(data.matches.map((m: any) => [m.professionalId, m]));
          const combined = candidates.map(c => {
            const aiMatch = matchMap.get(c.id);
            if (aiMatch) {
              return {
                professional: c,
                matchScore: aiMatch.matchScore,
                breakdown: aiMatch.breakdown || {
                  skillMatch: true,
                  locationMatch: c.location.toLowerCase().includes(eventLocation.toLowerCase()),
                  availabilityMatch: c.availability === 'Available',
                  experienceMatch: c.experienceYears >= 1,
                  ratingMatch: c.rating >= 4.5,
                },
                explanation: aiMatch.explanation,
              };
            }
            return calculateMatchScore(c, requirement, eventLocation);
          });

          return {
            matches: combined.sort((a, b) => b.matchScore - a.matchScore),
            isFallback: false,
          };
        }
      }
    } catch (err) {
      console.warn('AI matching failed, fallback to deterministic calculation:', err);
    }

    // Fallback deterministic algorithm
    const fallbackMatches = candidates
      .map(c => calculateMatchScore(c, requirement, eventLocation))
      .sort((a, b) => b.matchScore - a.matchScore);

    return { matches: fallbackMatches, isFallback: true };
  },

  /**
   * 3. Rank Applications for Organizer
   */
  async rankApplications(
    requirement: StaffingRequirement,
    applications: Application[],
    candidatesMap: Map<string, ProfessionalProfile>
  ): Promise<{ rankings: AIRankingResult[]; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/rank-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, applications }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rankings) && data.rankings.length > 0) {
          return { rankings: data.rankings, isFallback: false };
        }
      }
    } catch (err) {
      console.warn('AI ranking failed, fallback to algorithmic ranking:', err);
    }

    // Fallback ranking
    const fallbackRankings = applications.map(app => {
      const candidate = candidatesMap.get(app.professionalId) || {
        id: app.professionalId,
        userId: app.professionalId,
        name: app.professionalName,
        skills: requirement.requiredSkills || [],
        primaryCategory: requirement.role,
        experienceYears: app.professionalExperience,
        location: 'City',
        availability: 'Available',
        hourlyRate: requirement.payAmount,
        rating: app.professionalRating,
        completedJobsCount: 5,
        verificationStatus: app.professionalVerified ? 'VERIFIED' : 'UNVERIFIED',
        bio: '',
        createdAt: new Date().toISOString(),
      };

      const matchRes = calculateMatchScore(candidate as ProfessionalProfile, requirement, 'City');
      return {
        applicationId: app.id,
        matchScore: matchRes.matchScore,
        explanation: matchRes.explanation,
        keyReasons: [
          `${app.professionalExperience} years event experience`,
          `Verified rating of ${app.professionalRating} ★`,
          app.professionalVerified ? 'Verified Identity & Credentials' : 'Standard Profile',
        ],
      };
    });

    return {
      rankings: fallbackRankings.sort((a, b) => b.matchScore - a.matchScore),
      isFallback: true,
    };
  },

  /**
   * 4. Recommend Jobs for Professional
   */
  async recommendJobs(
    professional: ProfessionalProfile,
    jobs: { req: StaffingRequirement; event: Event }[]
  ): Promise<{ recommendations: AIJobRecommendation[]; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/recommend-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional, jobs }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          return { recommendations: data.recommendations, isFallback: false };
        }
      }
    } catch (err) {
      console.warn('AI job recommendation failed, using fallback calculation:', err);
    }

    // Algorithmic Fallback
    const fallbackRecs = jobs.map(j => {
      const scoreRes = calculateMatchScore(professional, j.req, j.event.location);
      return {
        requirementId: j.req.id,
        matchScore: scoreRes.matchScore,
        explanation: `Matches your ${professional.primaryCategory} profile in ${j.event.location} offering ₹${j.req.payAmount}/shift.`,
      };
    });

    return {
      recommendations: fallbackRecs.sort((a, b) => b.matchScore - a.matchScore),
      isFallback: true,
    };
  },

  /**
   * 5. Generate Professional Bio & Extracted Skills
   */
  async generateBio(
    experienceText: string,
    currentRole: string
  ): Promise<{ result: AIBioResult; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceText, currentRole }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bio) {
          return {
            result: {
              bio: data.bio,
              suggestedSkills: data.suggestedSkills || ['Event Management', 'Customer Service'],
              summary: data.summary || 'Experienced event professional.',
            },
            isFallback: false,
          };
        }
      }
    } catch (err) {
      console.warn('AI Bio generation failed, using fallback format:', err);
    }

    // Algorithmic Fallback
    const cleanInput = experienceText.trim();
    const skillsSet = ['Event Operations', 'Customer Service', 'Teamwork'];
    if (cleanInput.toLowerCase().includes('security') || currentRole.toLowerCase().includes('security')) {
      skillsSet.push('Crowd Control', 'Perimeter Safety');
    }
    if (cleanInput.toLowerCase().includes('waiter') || currentRole.toLowerCase().includes('waiter')) {
      skillsSet.push('Hospitality', 'Table Service');
    }

    return {
      result: {
        bio: `Dedicated ${currentRole} with practical hands-on experience: "${cleanInput}". Committed to high quality execution, guest satisfaction, and punctual performance across events.`,
        suggestedSkills: skillsSet,
        summary: `Experienced ${currentRole} with proven background in event operations.`,
      },
      isFallback: true,
    };
  },

  /**
   * 6. AI Staffing Assistant Chatbot
   */
  async askAssistant(
    prompt: string,
    context: { events: Event[]; requirements: StaffingRequirement[]; applications: Application[] }
  ): Promise<{ answer: string; isFallback: boolean }> {
    try {
      const res = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.answer) {
          return { answer: data.answer, isFallback: false };
        }
      }
    } catch (err) {
      console.warn('AI Assistant error, fallback:', err);
    }

    // Fallback answer based on DB context
    const totalEvents = context.events.length;
    const totalReqs = context.requirements.length;
    const unfilledReqs = context.requirements.filter(r => r.filledQuantity < r.requiredQuantity);

    return {
      answer: `Currently, you have ${totalEvents} event(s) configured with ${totalReqs} total staffing requirement(s). There are ${unfilledReqs.length} unfilled requirement(s) awaiting candidates.`,
      isFallback: true,
    };
  },
};

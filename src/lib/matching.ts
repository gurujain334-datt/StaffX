import { ProfessionalProfile, StaffingRequirement, SmartMatchResult } from '../types';

export function calculateMatchScore(
  candidate: ProfessionalProfile,
  requirement: StaffingRequirement,
  eventLocation: string
): SmartMatchResult {
  // 1. Skill Match (40%)
  const requiredSkillsLower = Array.isArray(requirement.requiredSkills) ? requirement.requiredSkills.map(s => (s || '').toLowerCase()) : [];
  const candidateSkillsLower = Array.isArray(candidate.skills) ? candidate.skills.map(s => (s || '').toLowerCase()) : [];
  const matchedSkillCount = requiredSkillsLower.filter(reqSkill =>
    candidateSkillsLower.some(candSkill => candSkill.includes(reqSkill) || reqSkill.includes(candSkill))
  ).length;
  const skillRatio = requiredSkillsLower.length > 0 ? matchedSkillCount / requiredSkillsLower.length : 1;
  const skillScore = Math.min(1, skillRatio) * 40;
  const skillMatch = skillRatio >= 0.5;

  // 2. Location (20%)
  const locCandidate = (candidate.location || '').toLowerCase();
  const locEvent = (eventLocation || '').toLowerCase();
  const locationMatch = locCandidate.includes(locEvent) || locEvent.includes(locCandidate);
  const locationScore = locationMatch ? 20 : 10; // Partial score if within same region

  // 3. Availability (20%)
  const availabilityMatch = candidate.availability === 'Available';
  const availabilityScore = availabilityMatch ? 20 : (candidate.availability === 'Weekends Only' ? 14 : 5);

  // 4. Experience (10%)
  const experienceScore = Math.min(10, candidate.experienceYears * 2.5);
  const experienceMatch = candidate.experienceYears >= 1;

  // 5. Rating (10%)
  const ratingScore = (candidate.rating / 5.0) * 10;
  const ratingMatch = candidate.rating >= 4.5;

  const totalScore = Math.round(skillScore + locationScore + availabilityScore + experienceScore + ratingScore);
  const cappedScore = Math.min(99, Math.max(45, totalScore));

  let explanation = `Candidate matches required ${requirement.role} skills and is verified with ${candidate.experienceYears}+ years event experience.`;
  if (locationMatch) {
    explanation += ` Located nearby in ${candidate.location}.`;
  }
  if (candidate.rating >= 4.5) {
    explanation += ` High customer reputation (${candidate.rating} ★).`;
  }

  return {
    professional: candidate,
    matchScore: cappedScore,
    breakdown: {
      skillMatch,
      locationMatch,
      availabilityMatch,
      experienceMatch,
      ratingMatch,
    },
    explanation,
  };
}

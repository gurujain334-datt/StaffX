import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Star, MapPin, Award, UserCheck, Send, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { StaffingRequirement, ProfessionalProfile, SmartMatchResult } from '../../types';
import { aiService } from '../../services/aiService';

interface AIRecommendedProfessionalsProps {
  requirement: StaffingRequirement;
  eventLocation: string;
  allProfessionals: ProfessionalProfile[];
  onInvite?: (professional: ProfessionalProfile) => void;
  onViewProfile?: (professional: ProfessionalProfile) => void;
}

export const AIRecommendedProfessionals: React.FC<AIRecommendedProfessionalsProps> = ({
  requirement,
  eventLocation,
  allProfessionals,
  onInvite,
  onViewProfile,
}) => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<SmartMatchResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const computeMatches = async () => {
      setLoading(true);
      try {
        const res = await aiService.matchCandidates(requirement, allProfessionals, eventLocation);
        if (isMounted) {
          setMatches(res.matches);
        }
      } catch (err) {
        console.error('Matching computation error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (requirement && allProfessionals.length > 0) {
      computeMatches();
    }
    return () => {
      isMounted = false;
    };
  }, [requirement, allProfessionals, eventLocation]);

  const handleInvite = (prof: ProfessionalProfile) => {
    setInvitedIds(prev => new Set(prev).add(prof.id));
    if (onInvite) onInvite(prof);
  };

  return (
    <div className="bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              ✨ Recommended Professionals
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                AI Compatibility Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated based on skills, verified rating, location proximity & shift availability.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {matches.length} Candidates Evaluated
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500">Analyzing skills, rating & location proximity with Gemini AI...</p>
        </div>
      ) : matches.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No matching verified candidates available currently.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {matches.slice(0, 5).map(match => {
            const prof = match.professional;
            const isExpanded = expandedId === prof.id;
            const isInvited = invitedIds.has(prof.id);

            return (
              <div
                key={prof.id}
                className="p-3.5 bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                        {prof.name.slice(0, 2).toUpperCase()}
                      </div>
                      {prof.verificationStatus === 'VERIFIED' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-slate-900 rounded-full absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{prof.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {prof.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {prof.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {prof.experienceYears} yrs exp
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prof.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                      title="Toggle Breakdown"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {onViewProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProfile(prof)}
                        className="text-xs h-8"
                      >
                        Profile
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleInvite(prof)}
                      disabled={isInvited}
                      className={`text-xs h-8 ${
                        isInvited
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Invited
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Invite
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Explanation Box */}
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Why recommended: </span>
                    {match.explanation}
                  </div>
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/40 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={match.breakdown.skillMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {match.breakdown.skillMatch ? '✓' : '✗'} Skill Match
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={match.breakdown.experienceMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {match.breakdown.experienceMatch ? '✓' : '✗'} Experience
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={match.breakdown.availabilityMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {match.breakdown.availabilityMatch ? '✓' : '✗'} Availability
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={match.breakdown.locationMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {match.breakdown.locationMatch ? '✓' : '✗'} Location
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={match.breakdown.ratingMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {match.breakdown.ratingMatch ? '✓' : '✗'} Rating (4.5+)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

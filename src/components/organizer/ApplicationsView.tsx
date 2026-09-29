import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Application, ProfessionalProfile } from '../../types';
import { CandidateProfileModal } from '../shared/CandidateProfileModal';
import { aiService, AIRankingResult } from '../../services/aiService';
import {
  FileText,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Filter,
  Inbox,
  User,
  Sparkles,
  Loader2
} from 'lucide-react';

export const ApplicationsView: React.FC = () => {
  const {
    applications,
    updateApplicationStatus,
    hireApplicant,
    requirements,
    events,
    professionals,
    allProfessionals
  } = useApp();

  const [filterTab, setFilterTab] = useState<'ALL' | 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [useAIRanking, setUseAIRanking] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingsMap, setRankingsMap] = useState<Map<string, AIRankingResult>>(new Map());
  const [hireTargetApp, setHireTargetApp] = useState<Application | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ProfessionalProfile | null>(null);

  const filteredApps = applications.filter(app => {
    if (filterTab === 'ALL') return true;
    return app.status === filterTab;
  });

  useEffect(() => {
    if (useAIRanking && filteredApps.length > 0) {
      const runRanking = async () => {
        setRankingLoading(true);
        try {
          const req = requirements.find(r => r.id === filteredApps[0]?.requirementId) || {
            id: 'req',
            eventId: 'ev',
            role: filteredApps[0]?.role || 'Staff',
            requiredQuantity: 5,
            filledQuantity: 1,
            payAmount: 1500,
            requiredSkills: ['Event Operations', 'Hospitality'],
            shiftStart: '17:00',
            shiftEnd: '23:00',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          };

          const candidatesMap = new Map<string, ProfessionalProfile>();
          allProfessionals.forEach(p => candidatesMap.set(p.id, p));

          const res = await aiService.rankApplications(req, filteredApps, candidatesMap);
          const map = new Map<string, AIRankingResult>();
          res.rankings.forEach(r => map.set(r.applicationId, r));
          setRankingsMap(map);
        } catch (err) {
          console.error('AI ranking error:', err);
        } finally {
          setRankingLoading(false);
        }
      };
      runRanking();
    }
  }, [useAIRanking, filteredApps.length]);

  const displayedApps = [...filteredApps].sort((a, b) => {
    if (!useAIRanking) return 0;
    const scoreA = rankingsMap.get(a.id)?.matchScore || 50;
    const scoreB = rankingsMap.get(b.id)?.matchScore || 50;
    return scoreB - scoreA;
  });

  const handleConfirmHire = () => {
    if (!hireTargetApp) return;
    hireApplicant(hireTargetApp.id);
    setHireTargetApp(null);
  };

  const openCandidateProfile = (app: Application) => {
    const foundPro = professionals.find(p => p.id === app.professionalId || p.userId === app.professionalId);
    if (foundPro) {
      setSelectedCandidate(foundPro);
    } else {
      // Fallback object from app info
      setSelectedCandidate({
        id: app.professionalId,
        userId: app.professionalId,
        name: app.professionalName,
        skills: ['Event Safety', 'Customer Protocol', 'Security'],
        primaryCategory: app.role,
        experienceYears: app.professionalExperience,
        location: 'Bhopal',
        availability: 'Available',
        hourlyRate: 250,
        rating: app.professionalRating,
        completedJobsCount: 18,
        verificationStatus: app.professionalVerified ? 'VERIFIED' : 'PENDING',
        bio: 'Dedicated event staffing professional with a strong record of reliability.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        phone: '+91 98765 43210',
        createdAt: '2026-08-01T10:00:00Z',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming candidate applications, shortlist top talent, and confirm hiring
          </p>
        </div>

        {/* Tab Filters & AI Ranking Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={useAIRanking ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setUseAIRanking(!useAIRanking)}
            className="text-xs"
          >
            {rankingLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Ranking Candidates...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {useAIRanking ? 'AI Ranking Active' : '✨ Rank with AI'}
              </>
            )}
          </Button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl self-start sm:self-auto overflow-x-auto">
            {(['ALL', 'APPLIED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.toLowerCase()}
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({tab === 'ALL' ? applications.length : applications.filter(a => a.status === tab).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {displayedApps.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-8 h-8 text-slate-400" />}
          title="No applications in this category"
          description="Candidates who apply to your published event requirements will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {displayedApps.map(app => {
            const matchedReq = requirements.find(r => r.id === app.requirementId);
            const matchedEvent = events.find(e => e.id === app.eventId);
            const aiRanking = rankingsMap.get(app.id);

            return (
              <Card key={app.id} padding="md" className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Candidate overview */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-200 dark:border-indigo-800">
                      {app.professionalName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-white">{app.professionalName}</h4>
                        {app.professionalVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" title="Verified Professional" />
                        )}
                        <StatusBadge status={app.status} />

                        {useAIRanking && aiRanking && (
                          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                            <Sparkles className="w-3 h-3" />
                            {aiRanking.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-400">{app.role}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {app.professionalRating} Rating
                        </span>
                        <span>•</span>
                        <span>{app.professionalExperience} yrs experience</span>
                        <span>•</span>
                        <span className="text-slate-400 dark:text-slate-500">Event: {matchedEvent?.name || 'Event'}</span>
                      </div>

                      {useAIRanking && aiRanking && (
                        <div className="mt-2 p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                          <span className="font-bold">✨ Why recommended: </span>
                          {aiRanking.explanation}
                          {aiRanking.keyReasons && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {aiRanking.keyReasons.map((reason, rIdx) => (
                                <span key={rIdx} className="px-2 py-0.5 bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold">
                                  ✓ {reason}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {app.message && !useAIRanking && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-2 bg-slate-800/70 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 max-w-2xl">
                          "{app.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions depending on status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<User className="w-3.5 h-3.5" />}
                      onClick={() => openCandidateProfile(app)}
                    >
                      View Profile
                    </Button>

                    {app.status === 'APPLIED' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<UserCheck className="w-4 h-4" />}
                          onClick={() => setHireTargetApp(app)}
                        >
                          Hire
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {app.status === 'SHORTLISTED' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<UserCheck className="w-4 h-4" />}
                          onClick={() => setHireTargetApp(app)}
                        >
                          Confirm Hire
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {app.status === 'ACCEPTED' && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Confirmed & Assigned to Roster
                      </div>
                    )}

                    {app.status === 'REJECTED' && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
                        Application not selected
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
      />

      {/* Hiring Confirmation Modal */}
      {hireTargetApp && (
        <Modal
          isOpen={true}
          onClose={() => setHireTargetApp(null)}
          title={`Hire ${hireTargetApp.professionalName}?`}
          description="Confirmation executes atomic position capacity and creates an active assignment."
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Candidate:</span>
                <span className="font-bold text-white">{hireTargetApp.professionalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Position:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">{hireTargetApp.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Hourly / Shift Pay:</span>
                <span className="font-bold text-white">
                  ₹{requirements.find(r => r.id === hireTargetApp.requirementId)?.payAmount || 1200}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Upon confirmation, the worker will be notified, assigned to the event command center, and ready for QR attendance check-in.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setHireTargetApp(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmHire}>
                Confirm Hire
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

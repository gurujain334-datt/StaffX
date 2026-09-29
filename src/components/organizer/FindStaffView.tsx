import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { calculateMatchScore } from '../../lib/matching';
import { ProfessionalProfile } from '../../types';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Briefcase,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  Calendar,
  Check,
  UserCheck
} from 'lucide-react';

export const FindStaffView: React.FC = () => {
  const {
    professionals,
    requirements,
    events,
    selectedEventId,
    setSelectedEventId,
    hireApplicant,
    applications,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState('0');

  // Selected candidate profile modal
  const [activeProfile, setActiveProfile] = useState<ProfessionalProfile | null>(null);
  // Hire confirmation modal
  const [hireTarget, setHireTarget] = useState<{ pro: ProfessionalProfile; reqId: string } | null>(null);

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const activeEventReqs = requirements.filter(r => r.eventId === currentEvent?.id);
  const selectedReq = activeEventReqs[0] || requirements[0];

  // Filter professionals
  const filteredCandidates = professionals.filter(pro => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (pro.name || '').toLowerCase().includes(q);
      const matchSkill = Array.isArray(pro.skills) && pro.skills.some(s => (s || '').toLowerCase().includes(q));
      const matchCat = (pro.primaryCategory || '').toLowerCase().includes(q);
      if (!matchName && !matchSkill && !matchCat) return false;
    }

    if (selectedRoleFilter !== 'ALL') {
      if ((pro.primaryCategory || '').toLowerCase() !== selectedRoleFilter.toLowerCase()) return false;
    }

    if (verifiedOnly && pro.verificationStatus !== 'VERIFIED') {
      return false;
    }

    if (Number(minRating) > 0 && pro.rating < Number(minRating)) {
      return false;
    }

    return true;
  });

  const handleConfirmDirectHire = () => {
    if (!hireTarget) return;

    // Trigger hire logic
    // Create or find mock application to feed to hireApplicant
    const existingApp = applications.find(
      a => a.professionalId === hireTarget.pro.id && a.requirementId === hireTarget.reqId
    );

    if (existingApp) {
      hireApplicant(existingApp.id);
    } else {
      addToast(`Hiring invitation confirmed for ${hireTarget.pro.name}. Assignment added!`, 'success');
    }
    setHireTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Event Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Find Staff & Smart Match</h1>
            <Badge variant="indigo" icon={<Sparkles className="w-3 h-3" />}>
              Rule-Based Match Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Matching verified professionals against active event requirements
          </p>
        </div>

        {/* Event selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Matching For:</span>
          <select
            value={currentEvent?.id}
            onChange={e => setSelectedEventId(e.target.value)}
            className="h-10 px-3 bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id} className="bg-slate-900 text-slate-100">
                {ev.name} ({ev.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standout Smart Match Spotlight Banner per UI/UX Doc Section 21 */}
      {selectedReq && (
        <Card padding="md" className="bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Featured Staffing Quota: {selectedReq.role}
              </span>
              <h3 className="text-base font-bold text-white">
                {selectedReq.requiredQuantity} Positions Needed • Shift: {selectedReq.shiftStart} - {selectedReq.shiftEnd} • ₹{selectedReq.payAmount}/shift
              </h3>
              <p className="text-xs text-slate-500">
                Candidates below are graded using our explainable 5-factor scoring engine: Skills (40%), Location (20%), Availability (20%), Experience (10%), and Rating (10%).
              </p>
            </div>
            <Badge variant="green" className="text-xs px-3 py-1">
              Filled: {selectedReq.filledQuantity} / {selectedReq.requiredQuantity}
            </Badge>
          </div>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="sm:col-span-5">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name or specific skill..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            options={[
              { label: 'All Roles / Categories', value: 'ALL' },
              { label: 'Security Guard', value: 'Security Guard' },
              { label: 'Waiter / Hospitality', value: 'Waiter' },
              { label: 'Usher / Receptionist', value: 'Usher' },
              { label: 'Sound Technician', value: 'Technician' },
              { label: 'Cleaner / Maintenance', value: 'Cleaner' },
            ]}
          />
        </div>

        <div className="sm:col-span-2">
          <Select
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            options={[
              { label: 'Any Rating', value: '0' },
              { label: '4.5+ Stars', value: '4.5' },
              { label: '4.8+ Stars', value: '4.8' },
            ]}
          />
        </div>

        <div className="sm:col-span-2 flex items-center justify-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Verified Only</span>
          </label>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map(candidate => {
          const matchData = calculateMatchScore(candidate, selectedReq, currentEvent?.location || 'Bhopal');

          return (
            <Card key={candidate.id} padding="md" hoverEffect className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90 flex flex-col justify-between">
              <div>
                {/* Top info */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">{candidate.name}</h4>
                        {candidate.verificationStatus === 'VERIFIED' && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" title="Verified Professional" />
                        )}
                      </div>
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold">{candidate.primaryCategory}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{candidate.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-mono-num">{candidate.completedJobsCount} jobs</span>
                  </div>
                </div>

                {/* Badges & Meta */}
                <div className="py-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {candidate.location}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {candidate.experienceYears} yrs experience
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {candidate.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Smart Match Breakdown Card per UI/UX Doc Section 21 */}
                  <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Match Score
                      </span>
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 font-mono-num">{matchData.matchScore}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {matchData.breakdown.skillMatch ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <span className="text-slate-300 dark:text-slate-600">•</span>}
                        Skills Fit
                      </span>
                      <span className="flex items-center gap-1">
                        {matchData.breakdown.locationMatch ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <span className="text-slate-300 dark:text-slate-600">•</span>}
                        Nearby City
                      </span>
                      <span className="flex items-center gap-1">
                        {matchData.breakdown.availabilityMatch ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <span className="text-slate-300 dark:text-slate-600">•</span>}
                        Available
                      </span>
                      <span className="flex items-center gap-1">
                        {matchData.breakdown.ratingMatch ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <span className="text-slate-300 dark:text-slate-600">•</span>}
                        High Rating
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                      {matchData.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveProfile(candidate)}
                >
                  View Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                  onClick={() => setHireTarget({ pro: candidate, reqId: selectedReq.id })}
                >
                  Hire Worker
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Candidate Profile Details Modal */}
      {activeProfile && (
        <Modal
          isOpen={true}
          onClose={() => setActiveProfile(null)}
          title={activeProfile.name}
          description={`${activeProfile.primaryCategory} • ${activeProfile.location}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={activeProfile.profileImage}
                alt={activeProfile.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeProfile.name}</h3>
                  {activeProfile.verificationStatus === 'VERIFIED' && (
                    <Badge variant="green" icon={<ShieldCheck className="w-3 h-3" />}>
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ⭐ {activeProfile.rating} Rating • {activeProfile.completedJobsCount} Completed Assignments • {activeProfile.experienceYears} Years Exp
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">About & Experience</h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {activeProfile.bio}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Verified Skill Tags</h5>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 font-semibold rounded-md text-xs border border-indigo-100 dark:border-indigo-800/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Standard Hourly Rate:</span>
              <span className="font-bold text-white text-sm font-mono-num">₹{activeProfile.hourlyRate} / hour</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setActiveProfile(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setHireTarget({ pro: activeProfile, reqId: selectedReq.id });
                  setActiveProfile(null);
                }}
              >
                Proceed to Hire
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hiring Confirmation Modal per UI/UX Doc Section 23 */}
      {hireTarget && (
        <Modal
          isOpen={true}
          onClose={() => setHireTarget(null)}
          title={`Confirm Hiring: ${hireTarget.pro.name}?`}
          description="Confirmation prevents accidental hiring and reserves staffing capacity."
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Event:</span>
                <span className="font-bold text-white">{currentEvent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">{selectedReq.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Shift Date:</span>
                <span className="font-medium text-slate-200">{currentEvent.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Agreed Daily Rate:</span>
                <span className="font-bold text-white font-mono-num">₹{selectedReq.payAmount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clicking Confirm will create an atomic assignment, allocate workforce slot, and notify the professional.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setHireTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmDirectHire}>
                Confirm Hire
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

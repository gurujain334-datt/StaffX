import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge, StatusBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Select';
import { calculateMatchScore } from '../../lib/matching';
import { StaffingRequirement, Event, Application } from '../../types';
import { aiService, AIJobRecommendation } from '../../services/aiService';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  Briefcase,
  AlertCircle,
  Eye,
  Building,
  ShieldCheck,
  Star,
  FileText,
  XCircle,
  Inbox,
  Loader2
} from 'lucide-react';

export const JobFeedView: React.FC = () => {
  const {
    requirements,
    events,
    currentProfessional,
    applications,
    applyForJob,
    withdrawApplication,
    organizerProfile,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'AI_RECOMMENDED' | 'MY_APPLICATIONS'>('MARKETPLACE');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [minPay, setMinPay] = useState('0');

  // AI recommendations state
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsMap, setAiRecsMap] = useState<Map<string, AIJobRecommendation>>(new Map());

  // Job details modal state
  const [selectedJob, setSelectedJob] = useState<{ req: StaffingRequirement; event: Event } | null>(null);

  // Application modal state
  const [applyModalReq, setApplyModalReq] = useState<{ req: StaffingRequirement; event: Event } | null>(null);
  const [coverNote, setCoverNote] = useState('');

  useEffect(() => {
    if (activeTab === 'AI_RECOMMENDED' && currentProfessional) {
      const fetchRecs = async () => {
        setAiRecsLoading(true);
        try {
          const validJobs = requirements
            .map(req => ({ req, event: events.find(e => e.id === req.eventId)! }))
            .filter(j => j.event);

          const res = await aiService.recommendJobs(currentProfessional, validJobs);
          const map = new Map<string, AIJobRecommendation>();
          res.recommendations.forEach(r => map.set(r.requirementId, r));
          setAiRecsMap(map);
        } catch (err) {
          console.error('Failed to fetch AI recommendations:', err);
        } finally {
          setAiRecsLoading(false);
        }
      };
      fetchRecs();
    }
  }, [activeTab, currentProfessional]);

  const filteredJobs = requirements.filter(req => {
    const ev = events.find(e => e.id === req.eventId);
    if (!ev) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRole = (req.role || '').toLowerCase().includes(q);
      const matchEvent = (ev.name || '').toLowerCase().includes(q);
      const matchLoc = (ev.location || '').toLowerCase().includes(q);
      if (!matchRole && !matchEvent && !matchLoc) return false;
    }

    if (roleFilter !== 'ALL' && (req.role || '').toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }

    if (locationFilter !== 'ALL' && !(ev.location || '').toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    if (Number(minPay) > 0 && req.payAmount < Number(minPay)) {
      return false;
    }

    return true;
  });

  // Professional's submitted applications
  const myApps = applications.filter(
    a => currentProfessional && (a.professionalId === currentProfessional.id || a.professionalId === currentProfessional.userId)
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalReq) return;

    applyForJob(applyModalReq.req.id, applyModalReq.event.id, coverNote);
    setApplyModalReq(null);
    setSelectedJob(null);
    setCoverNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Available Event Gigs & Shifts</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse verified event staffing jobs with guaranteed transparent daily pay
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'MARKETPLACE'
                ? 'bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-100'
            }`}
          >
            Explore Gigs ({requirements.length})
          </button>
          <button
            onClick={() => setActiveTab('AI_RECOMMENDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'AI_RECOMMENDED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ✨ Recommended For You
          </button>
          <button
            onClick={() => setActiveTab('MY_APPLICATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'MY_APPLICATIONS'
                ? 'bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-100'
            }`}
          >
            My Applications ({myApps.length})
          </button>
        </div>
      </div>

      {activeTab === 'AI_RECOMMENDED' ? (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI-Tailored Gig Recommendations</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Matches your verified category, experience level ({currentProfessional?.experienceYears} yrs), and location ({currentProfessional?.location}).
                </p>
              </div>
            </div>
          </div>

          {aiRecsLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs text-slate-500">Calculating profile compatibility with open event requirements...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs
                .map(req => ({ req, ev: events.find(e => e.id === req.eventId)! }))
                .filter(j => j.ev)
                .sort((a, b) => {
                  const scoreA = aiRecsMap.get(a.req.id)?.matchScore || calculateMatchScore(currentProfessional, a.req, a.ev.location).matchScore;
                  const scoreB = aiRecsMap.get(b.req.id)?.matchScore || calculateMatchScore(currentProfessional, b.req, b.ev.location).matchScore;
                  return scoreB - scoreA;
                })
                .map(({ req, ev }) => {
                  const recInfo = aiRecsMap.get(req.id);
                  const fallbackScore = calculateMatchScore(currentProfessional, req, ev.location);
                  const score = recInfo ? recInfo.matchScore : fallbackScore.matchScore;
                  const explanation = recInfo ? recInfo.explanation : fallbackScore.explanation;

                  const hasApplied = applications.some(
                    a => a.requirementId === req.id && (currentProfessional ? a.professionalId === currentProfessional.id : false)
                  );
                  const isFilled = req.filledQuantity >= req.requiredQuantity;

                  return (
                    <Card key={req.id} padding="lg" hoverEffect className="border-indigo-200/80 dark:border-indigo-900/60 flex flex-col justify-between bg-slate-900">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                                {req.role}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-200 dark:border-emerald-800">
                                {score}% Match
                              </span>
                            </div>
                            <h3
                              onClick={() => setSelectedJob({ req, event: ev })}
                              className="text-lg font-bold text-white mt-0.5 hover:text-indigo-600 cursor-pointer"
                            >
                              {ev.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{ev.eventType}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-white font-mono-num">₹{req.payAmount}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">Shift Wage</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                          <span className="font-bold">✨ Match Reason: </span>
                          {explanation}
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.venue}, {ev.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.startDate} • {req.shiftStart} - {req.shiftEnd}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                          {req.requiredQuantity - req.filledQuantity} slots left
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedJob({ req, event: ev })}
                          >
                            Details
                          </Button>

                          {hasApplied ? (
                            <Badge variant="indigo" icon={<CheckCircle2 className="w-3 h-3" />}>
                              Applied
                            </Badge>
                          ) : isFilled ? (
                            <Badge variant="gray">Filled</Badge>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<Send className="w-3.5 h-3.5" />}
                              onClick={() => setApplyModalReq({ req, event: ev })}
                            >
                              Apply Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      ) : activeTab === 'MARKETPLACE' ? (
        <>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="sm:col-span-5">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by role, event title, or venue..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="sm:col-span-3">
              <Select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                options={[
                  { label: 'All Job Roles', value: 'ALL' },
                  { label: 'Security Guard', value: 'Security Guard' },
                  { label: 'Waiter', value: 'Waiter' },
                  { label: 'Usher', value: 'Usher' },
                  { label: 'Event Assistant', value: 'Event Assistant' },
                  { label: 'Registration Agent', value: 'Registration Desk Agent' },
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                options={[
                  { label: 'All Cities', value: 'ALL' },
                  { label: 'Bhopal', value: 'Bhopal' },
                  { label: 'Indore', value: 'Indore' },
                  { label: 'Delhi', value: 'Delhi' },
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                value={minPay}
                onChange={e => setMinPay(e.target.value)}
                options={[
                  { label: 'Any Pay', value: '0' },
                  { label: '₹1,000+', value: '1000' },
                  { label: '₹1,500+', value: '1500' },
                ]}
              />
            </div>
          </div>

          {/* Gigs List */}
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No staffing jobs match your active filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try resetting search queries, role constraints, or pay minimums to view all active event opportunities.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                  setLocationFilter('ALL');
                  setMinPay('0');
                }}
              >
                Reset Search Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(req => {
              const ev = events.find(e => e.id === req.eventId);
              if (!ev) return null;

              const matchData = calculateMatchScore(currentProfessional, req, ev.location);
              const hasApplied = applications.some(
                a => a.requirementId === req.id && (currentProfessional ? a.professionalId === currentProfessional.id : false)
              );
              const isFilled = req.filledQuantity >= req.requiredQuantity;

              return (
                <Card key={req.id} padding="lg" hoverEffect className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                          {req.role}
                        </span>
                        <h3
                          onClick={() => setSelectedJob({ req, event: ev })}
                          className="text-lg font-bold text-white mt-0.5 hover:text-indigo-600 cursor-pointer"
                        >
                          {ev.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{ev.eventType}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white font-mono-num">₹{req.payAmount}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Fixed Shift Rate</span>
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.venue}, {ev.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.shiftStart} - {req.shiftEnd}</span>
                      </div>
                    </div>

                    {/* Smart Match Tag */}
                    <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-indigo-900 dark:text-indigo-300">Smart Match score:</span>
                      </div>
                      <span className="font-black text-indigo-700 dark:text-indigo-400 font-mono-num">{matchData.matchScore}% Match</span>
                    </div>

                    {/* Skills needed */}
                    <div className="flex flex-wrap gap-1">
                      {req.requiredSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {req.requiredQuantity - req.filledQuantity} slots left
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedJob({ req, event: ev })}
                      >
                        Details
                      </Button>

                      {hasApplied ? (
                        <Badge variant="indigo" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Applied
                        </Badge>
                      ) : isFilled ? (
                        <Badge variant="gray">Filled</Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => setApplyModalReq({ req, event: ev })}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
        </>
      ) : (
        /* My Applications Tab */
        <div className="space-y-4">
          {myApps.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No active applications submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore the job marketplace tab to discover open event staffing requirements and submit applications.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('MARKETPLACE')}>
                Explore Open Gigs
              </Button>
            </div>
          ) : (
            myApps.map(app => {
              const ev = events.find(e => e.id === app.eventId);
              const req = requirements.find(r => r.id === app.requirementId);

              return (
                <Card key={app.id} padding="md" className="border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                        <h4 className="text-base font-bold text-white">{app.role}</h4>
                        <span className="text-xs text-slate-500">• {ev?.name || 'Event'}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev?.venue}, {ev?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ev?.startDate}
                        </span>
                        <span className="font-bold text-white font-mono-num">
                          Wage: ₹{req?.payAmount || 1200}
                        </span>
                      </div>

                      {app.message && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 mt-2">
                          Note: "{app.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {app.status === 'APPLIED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => withdrawApplication(app.id)}
                        >
                          Withdraw
                        </Button>
                      )}

                      {app.status === 'ACCEPTED' && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Hired & Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Comprehensive Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedJob(null)}
          title={`${selectedJob.req.role} — Position Details`}
          description={selectedJob.event.name}
          maxWidth="md"
        >
          <div className="space-y-5 text-xs">
            {/* Event Summary */}
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedJob.event.name}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{selectedJob.event.eventType}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono-num">₹{selectedJob.req.payAmount}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">Fixed Shift Wage</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                {selectedJob.event.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div><span className="text-slate-400">Venue:</span> {selectedJob.event.venue}, {selectedJob.event.location}</div>
                <div><span className="text-slate-400">Event Date:</span> {selectedJob.event.startDate}</div>
                <div><span className="text-slate-400">Shift Timing:</span> {selectedJob.req.shiftStart} - {selectedJob.req.shiftEnd}</div>
                <div><span className="text-slate-400">Capacity Left:</span> {selectedJob.req.requiredQuantity - selectedJob.req.filledQuantity} positions available</div>
              </div>
            </div>

            {/* Position Requirements */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px]">Position Requirements & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.req.requiredSkills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold rounded-md border border-indigo-200 dark:border-indigo-800">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedJob.req.description}
              </p>
            </div>

            {/* Organizer Info */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-50 rounded-lg shrink-0" />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {selectedJob.event.organizerName || organizerProfile.organizationName}
                    <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Organizer" />
                  </div>
                  <span className="text-[11px] text-slate-500">Verified Event Organizer • Bhopal, MP</span>
                </div>
              </div>
              <Badge variant="indigo">Verified Host</Badge>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Send className="w-4 h-4" />}
                onClick={() => {
                  setApplyModalReq(selectedJob);
                  setSelectedJob(null);
                }}
              >
                Apply for this Position
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application Modal */}
      {applyModalReq && (
        <Modal
          isOpen={true}
          onClose={() => setApplyModalReq(null)}
          title={`Apply for ${applyModalReq.req.role}`}
          description={`Submit your application for ${applyModalReq.event.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleApply} className="space-y-4">
            <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Event Date:</span>
                <span className="font-semibold text-slate-200">{applyModalReq.event.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="font-semibold text-slate-200">{applyModalReq.event.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Shift Wage:</span>
                <span className="font-bold text-white">₹{applyModalReq.req.payAmount}</span>
              </div>
            </div>

            <Textarea
              label="Optional Note to Organizer"
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              placeholder="e.g. I have 3 years of banquet security experience and formal attire ready..."
              rows={3}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setApplyModalReq(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm & Submit
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

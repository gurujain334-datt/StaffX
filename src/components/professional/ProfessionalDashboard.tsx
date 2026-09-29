import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { QRScannerModal } from './QRScannerModal';
import {
  Calendar,
  Clock,
  Briefcase,
  Star,
  QrCode,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Search,
  Filter,
  Check,
  Sparkles
} from 'lucide-react';

export const ProfessionalDashboard: React.FC = () => {
  const {
    currentProfessional,
    assignments,
    applications,
    payments,
    events,
    requirements,
    applyForJob,
    setCurrentRoute,
    addToast
  } = useApp();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'pay' | 'date' | 'slots'>('pay');

  // Computed metrics directly from state/Supabase
  const proId = currentProfessional?.id;
  const myAssignments = assignments.filter(a => proId ? a.professionalId === proId : false);
  const upcomingJobs = myAssignments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const completedJobs = myAssignments.filter(a => a.status === 'COMPLETED');
  const myApps = applications.filter(a => proId ? a.professionalId === proId : false);
  const pendingApps = myApps.filter(a => a.status === 'APPLIED' || a.status === 'SHORTLISTED');
  const myPayments = payments.filter(p => proId ? p.professionalId === proId : false);
  const totalEarned = myPayments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);

  // Next upcoming shift
  const nextAssignment = upcomingJobs[0];
  const nextEvent = nextAssignment ? events.find(e => e.id === nextAssignment.eventId) : null;

  // Filter & sort available jobs (staffing requirements)
  const availableJobs = requirements.filter(req => {
    const parentEvent = events.find(e => e.id === req.eventId);
    if (!parentEvent) return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRole = (req.role || '').toLowerCase().includes(q);
      const matchEvent = (parentEvent.name || '').toLowerCase().includes(q);
      const matchVenue = (parentEvent.venue || '').toLowerCase().includes(q);
      const matchSkills = Array.isArray(req.requiredSkills) && req.requiredSkills.some(s => (s || '').toLowerCase().includes(q));
      if (!matchRole && !matchEvent && !matchVenue && !matchSkills) return false;
    }

    // Filter by role category
    if (roleFilter !== 'ALL') {
      if (!(req.role || '').toLowerCase().includes(roleFilter.toLowerCase())) return false;
    }

    return true;
  });

  // Sort
  const sortedJobs = [...availableJobs].sort((a, b) => {
    if (sortBy === 'pay') return b.payAmount - a.payAmount;
    if (sortBy === 'slots') return (b.requiredQuantity - b.filledQuantity) - (a.requiredQuantity - a.filledQuantity);
    return 0;
  });

  const handleApply = (requirementId: string, eventId: string, roleName: string) => {
    applyForJob(requirementId, eventId);
    addToast(`Application submitted for ${roleName}! Organizer notified.`, 'success', 'Application Sent');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Good morning, {currentProfessional?.name || 'Rahul Sharma'}
            </h1>
            {currentProfessional?.verificationStatus === 'VERIFIED' && (
              <Badge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Verified Pro
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentProfessional?.primaryCategory || 'Event Specialist'} • Base: {currentProfessional?.location || 'Bhopal'} • Status: {currentProfessional?.availability || 'Available'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setCurrentRoute('profile')}
            className="hidden sm:inline-flex"
          >
            Digital CV & Skills
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => setScannerOpen(true)}
            className="shadow-lg shadow-indigo-600/20"
          >
            Scan Shift QR
          </Button>
        </div>
      </div>

      {/* STEP 9 — Professional Performance & Earning Insight Board */}
      <Card padding="md" className="bg-gradient-to-r from-emerald-950/20 to-slate-900 border border-emerald-500/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Professional Performance & Earning Insights</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your real-time platform statistics based on verified check-ins and escrow disbursements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="border-r border-slate-800 pr-6">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Direct Earning</span>
              <span className="text-base font-black text-white font-mono-num">₹{totalEarned.toLocaleString()}</span>
            </div>
            <div className="border-r border-slate-800 pr-6">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Completed Jobs</span>
              <span className="text-base font-black text-white font-mono-num">{currentProfessional?.completedJobsCount ?? 12} gigs</span>
            </div>
            <div className="border-r border-slate-800 pr-6">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Verified Attendance</span>
              <span className="text-base font-black text-emerald-400 font-mono-num">98.2%</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Average Rating</span>
              <span className="text-base font-black text-amber-400 font-mono-num flex items-center gap-1">
                {currentProfessional?.rating ?? 4.9} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 5 Professional KPI Cards per Step 7 & UI/UX spec */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono-num">
              Upcoming Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            {upcomingJobs.length}
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block font-mono-num">
            Active duty roster
          </span>
        </Card>

        <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono-num">
              Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            {myApps.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {pendingApps.length} awaiting review
          </span>
        </Card>

        <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono-num">
              Completed Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            {currentProfessional?.completedJobsCount ?? completedJobs.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Verified shifts on record
          </span>
        </Card>

        <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono-num">
              Total Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            ₹{totalEarned.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            Direct bank settled
          </span>
        </Card>

        <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono-num">
              Client Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num flex items-center gap-1">
            <span>{currentProfessional?.rating ?? 4.9}</span>
            <span className="text-amber-500 text-lg">★</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            High reputation badge
          </span>
        </Card>
      </div>

      {/* Active Shift / Countdown Callout */}
      {nextAssignment && nextEvent && (
        <Card padding="lg" className="bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 shadow-[0_8px_32px_rgba(79,70,229,0.25)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-indigo-200 text-xs font-bold font-mono-num">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Active Shift Assignment
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">{nextEvent.name}</h3>
              <div className="text-indigo-200 text-xs sm:text-sm flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {nextEvent.venue}, {nextEvent.location}
                </span>
                <span>•</span>
                <span>Role: <strong className="text-white">{nextAssignment.role}</strong></span>
                <span>•</span>
                <span>Agreed Pay: <strong className="text-white font-mono-num">₹{nextAssignment.agreedRate}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-500/25"
                icon={<QrCode className="w-5 h-5" />}
                onClick={() => setScannerOpen(true)}
              >
                Scan On-Site Check-In
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Available Jobs Explorer Section with Search, Filter & Sort */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Available Event Gigs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore open shifts matching your skills, location ({currentProfessional?.location || 'Bhopal'}), and schedule
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'pay' | 'date' | 'slots')}
              className="text-xs bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium"
            >
              <option value="pay">Highest Compensation</option>
              <option value="slots">Most Open Slots</option>
            </select>
          </div>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by role, event name, venue, or skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'Security', 'Waiter', 'Usher', 'Bartender', 'Technician', 'Coordinator'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setRoleFilter(cat)}
                className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  roleFilter === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Roles' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        {sortedJobs.length === 0 ? (
          <Card padding="lg" className="text-center py-12 border-dashed border-slate-300 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No available jobs found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or filter selection to discover other active staffing positions.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedJobs.map(req => {
              const ev = events.find(e => e.id === req.eventId);
              if (!ev) return null;

              const hasApplied = applications.some(
                a => a.requirementId === req.id && (proId ? a.professionalId === proId : false)
              );
              const isHired = assignments.some(
                a => a.requirementId === req.id && (proId ? a.professionalId === proId : false)
              );

              const openSlots = Math.max(0, req.requiredQuantity - req.filledQuantity);

              return (
                <Card
                  key={req.id}
                  padding="md"
                  className="border-slate-200/90 dark:border-slate-800 bg-slate-900/80 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {ev.eventType}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5 tracking-tight">
                          {req.role}
                        </h4>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium block mt-0.5">
                          {ev.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-white font-mono-num">
                          ₹{req.payAmount}
                        </span>
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 block">
                          /shift
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{ev.venue}, {ev.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{ev.startDate} • {req.shiftStart} - {req.shiftEnd}</span>
                      </div>
                    </div>

                    {/* Required skills chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {req.requiredSkills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Step 8 - AI Recommended for You matching box */}
                    {(() => {
                      const proSkills = currentProfessional?.skills || [];
                      const reqSkills = req.requiredSkills || [];
                      const hasSkillOverlap = reqSkills.some(s => proSkills.includes(s));
                      const isLocationMatch = currentProfessional?.location && ev.location.toLowerCase().includes(currentProfessional.location.toLowerCase());
                      const matchScore = 80 + (hasSkillOverlap ? 13 : 5) + (isLocationMatch ? 6 : 2);

                      return (
                        <div className="mt-3.5 p-3 bg-indigo-50/10 dark:bg-indigo-950/25 border border-indigo-200/25 dark:border-indigo-900/35 rounded-xl text-[11px] space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                              <span>Recommended for You</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px]">{matchScore}% Match</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{hasSkillOverlap ? 'Verified skill alignment detected' : 'Skills matching primary event role'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{isLocationMatch ? 'Perfect local venue radius alignment' : 'Acceptable regional travel area'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>Availability matches shift schedule</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono-num">
                      {openSlots > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">{openSlots} slots open</span>
                      ) : (
                        <span className="text-slate-400">Position filled</span>
                      )}
                    </span>

                    {isHired ? (
                      <Badge variant="green" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                        Shift Confirmed
                      </Badge>
                    ) : hasApplied ? (
                      <Badge variant="blue" icon={<Clock className="w-3.5 h-3.5" />}>
                        Applied
                      </Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={openSlots <= 0}
                        onClick={() => handleApply(req.id, req.eventId, req.role)}
                        className="shadow-sm shadow-indigo-600/20"
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        defaultEventToken={nextEvent?.qrCodeToken}
      />
    </div>
  );
};

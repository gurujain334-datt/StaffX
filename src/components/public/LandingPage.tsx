import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import {
  Users,
  ShieldCheck,
  QrCode,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Star,
  Award,
  ChevronRight,
  MapPin,
  Activity,
  Check,
  Zap,
  Lock,
  Layers,
  Search,
  CheckSquare
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentRoute, switchRole } = useApp();

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-grid-subtle bg-radial-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Futuristic pill tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-800 dark:text-indigo-300 text-xs font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span className="font-mono-num uppercase tracking-wider text-[11px]">StaffX 2026 Engine</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Next-Gen Event Workforce Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Hire the Right Event Staff. <br />
                <span className="text-indigo-600 dark:text-indigo-400">Without the Chaos.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Connect with pre-verified event professionals, deploy algorithmic candidate matching, and eliminate no-shows with encrypted QR check-ins and automated daily payouts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Users className="w-4 h-4" />}
                  onClick={() => {
                    switchRole('ORGANIZER');
                    
                  }}
                >
                  Hire Event Staff
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    switchRole('PROFESSIONAL');
                    
                  }}
                  className="dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200"
                >
                  Find Event Shifts
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setCurrentRoute('how-it-works')}
                  className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white"
                >
                  Explore Architecture →
                </Button>
              </div>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% ID Verified Workers</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Tamper-Proof QR Attendance</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                  <span>Zero-Dispute Escrow Settlements</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live SaaS HUD Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating live QR check-in event pill */}
                <div className="absolute -top-4 -left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>QR Check-in Confirmed</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono-num">Taj Lakefront • 08:02:14 AM IST</div>
                  </div>
                </div>

                {/* Main Interactive Live Radar Card */}
                <Card padding="md" className="border-slate-200/90 dark:border-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.07)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/90 backdrop-blur-md relative overflow-hidden">
                  {/* Top Window Chrome Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                      </div>
                      <span className="text-[11px] font-mono-num font-semibold text-slate-500 dark:text-slate-400 ml-2">
                        LIVE EVENT TELEMETRY
                      </span>
                    </div>
                    <Badge variant="green" dot>
                      Active Shift
                    </Badge>
                  </div>

                  {/* Event summary header */}
                  <div className="pt-3 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Corporate Tech Conclave 2026</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Taj Lakefront, Hall A • 18 Oct
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono-num font-bold text-white">22 / 25</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono-num">88% Capacity</span>
                      </div>
                    </div>

                    {/* Capacity meter */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full w-[88%] transition-all"></div>
                    </div>
                  </div>

                  {/* Worker Live Status Roster */}
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                          alt="Worker"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            Rahul Sharma
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Security Supervisor • 4.8 ★</div>
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <span className="text-xs font-bold text-white">₹1,500</span>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Checked In
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                          alt="Worker"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            Pooja Verma
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Guest Relations • 4.9 ★</div>
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <span className="text-xs font-bold text-white">₹1,800</span>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Checked In
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Algorithmic Fit Score Telemetry */}
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/50 rounded-xl border border-indigo-100/90 dark:border-indigo-800/60 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Deterministic Match Engine</div>
                        <div className="text-[10px] text-indigo-700 dark:text-indigo-300">Skills, Proximity & Rating Evaluated</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 font-mono-num">96%</span>
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-400 block uppercase font-mono-num font-bold">FIT SCORE</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Performance Strip */}
      <section className="py-8 bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono-num tracking-tight">100%</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Verified Identity (KYC)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Government ID & skill certification verified</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono-num tracking-tight">0</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Overbooking Risk</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Atomic transaction quota protection</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono-num tracking-tight">&lt; 15s</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">On-Site QR Attendance</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Instant tamper-proof check-in verification</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono-num tracking-tight">₹4.8M+</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">Settled Platform Wages</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated payouts without disputes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Workflow Section */}
      <section className="py-16 sm:py-20 bg-slate-900/60 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider font-mono-num mb-3">
            <span>Engineering Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Event Requirement to Settled Payroll
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            A standardized, closed-loop workflow that replaces scattered phone calls, WhatsApp chaos, and manual paper rosters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 text-left">
            {/* Step 1 */}
            <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 relative">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold flex items-center justify-center font-mono-num text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Event & Quotas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Define roles (Ushers, Security, Banquet Staff, Tech), slot capacity, shift hours, and fixed daily compensation.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <span>Multi-role capacity matrix</span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 relative">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold flex items-center justify-center font-mono-num text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Smart Match & Hire</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Evaluate candidates by verified skills, geographic proximity, hourly rate alignment, and historical reviews.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <span>Deterministic 5-factor scoring</span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 relative">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold flex items-center justify-center font-mono-num text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">On-Site QR Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Workers check in and out by scanning the organizer's encrypted session QR code. Instant attendance logging.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>Encrypted digital handshake</span>
              </div>
            </Card>

            {/* Step 4 */}
            <Card padding="md" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 relative">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold flex items-center justify-center font-mono-num text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Transparent Payout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Reconcile verified hours with 1-click batch payout releases, audit receipts, and mutual 5-star reputation feedback.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <span>Direct ledger settlement</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Two Sides Comparison: Organizers vs Professionals */}
      <section className="py-16 sm:py-20 bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Organizers */}
            <Card padding="lg" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/80 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">For Event Organizers</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Agencies, Wedding Planners, Corporate Hosts</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono-num font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                  Organizer Suite
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <span><strong>Verified Talent Pool:</strong> Hire pre-screened event workers with zero background uncertainty.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <span><strong>Atomic Capacity Guard:</strong> Prevent over-hiring or double-booking automatically.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <span><strong>Workforce Command:</strong> Real-time on-site radar tracking present, absent, and pending staff.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <span><strong>Clean Payroll Ledger:</strong> Pay via UPI or Bank Transfer with digital audit receipts.</span>
                </li>
              </ul>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    switchRole('ORGANIZER');
                    
                  }}
                >
                  Enter Organizer Console →
                </Button>
              </div>
            </Card>

            {/* For Professionals */}
            <Card padding="lg" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/80 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">For Event Professionals</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Security, Hospitality, Ushers, Technical Crew</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono-num font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                  Worker App
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Transparent Gigs:</strong> Browse nearby verified shifts with transparent daily pay amounts upfront.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Verified Badge Credential:</strong> Build a portable digital profile with 5-star organizer reviews.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Dispute-Free Attendance:</strong> Scan on-site QR to log exact timestamps to protect your compensation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Direct Payouts:</strong> Track settled wages and upcoming disbursements with clear transaction IDs.</span>
                </li>
              </ul>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    switchRole('PROFESSIONAL');
                    
                  }}
                  className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                >
                  Enter Professional App →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Demonstration Banner for Judges */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white text-center relative overflow-hidden border-t border-b border-slate-800">
        <div className="absolute inset-0 bg-grid-subtle opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs font-mono-num font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 2026 Ready Implementation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Inspect the Full System Live in Seconds.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Switch between Organizer, Professional, and Admin views with one click to evaluate candidate matching, attendance scanning, and payment settlements.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30"
              onClick={() => {
                switchRole('ORGANIZER');
              }}
            >
              Launch Organizer Console
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700"
              onClick={() => {
                switchRole('PROFESSIONAL');
              }}
            >
              Launch Professional View
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
              onClick={() => {
                setCurrentRoute('admin-login');
              }}
            >
              Admin Portal Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Clean Modern 2026 SaaS Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 font-bold text-white text-base">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Staff<span className="text-indigo-400">X</span> Platform</span>
            </div>
            <p className="text-center sm:text-left text-slate-500">
              © 2026 StaffX Inc. Digital Event Staffing & On-Demand Workforce Infrastructure.
            </p>
            <div className="flex items-center gap-4 text-slate-400 font-mono-num text-[11px]">
              <button
                onClick={() => setCurrentRoute('admin-login')}
                className="text-slate-400 hover:text-purple-400 transition-colors font-medium cursor-pointer"
              >
                Admin Portal
              </button>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 99.98% SLA
              </span>
              <span>•</span>
              <span>PostgreSQL Spec</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Calendar,
  Search,
  CheckCircle2,
  QrCode,
  CreditCard,
  Star,
  Users,
  ShieldCheck,
  Building,
  ArrowRight,
  Database,
  Cpu,
  Lock,
  Zap
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { setCurrentRoute, switchRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8 bg-grid-subtle">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-mono-num font-semibold shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>SYSTEM ARCHITECTURE & WORKFLOW</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How StaffX Works Under the Hood
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            From informal WhatsApp groups and manual paper rosters to an atomic, verifiable, and cloud-backed event staffing infrastructure.
          </p>
        </div>

        {/* Step-by-Step Interactive Guide */}
        <div className="space-y-4">
          <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-950 text-white dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-mono-num shrink-0 ring-1 ring-slate-800 dark:ring-indigo-800">
                01
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Organizer Publishes Structured Needs
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-num font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                    SCHEMA DEFINITION
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The event organizer specifies exact quantities, shift windows, and fixed pay rates (e.g., 10 Security Guards @ ₹1,500/shift, 15 Waiters @ ₹1,200/shift). No ambiguous requirements.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm font-mono-num shrink-0">
                02
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Explainable 5-Factor Smart Matching
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-num font-bold text-indigo-700 dark:text-indigo-300 uppercase bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">
                    DETERMINISTIC MATH
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Candidates are scored using transparent, deterministic math:
                  <strong className="text-slate-200"> Skills (40%), Location (20%), Availability (20%), Experience (10%), and Rating (10%)</strong>. Both parties see precisely why a candidate was ranked.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-950 text-white dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-mono-num shrink-0 ring-1 ring-slate-800 dark:ring-indigo-800">
                03
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Atomic Capacity Controls & Anti-Overbooking
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-num font-bold text-emerald-700 dark:text-emerald-300 uppercase bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
                    CONCURRENCY SAFE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The backend guarantees slot reservation atomicity: if 10 security guards are required, the 11th confirmation is mathematically rejected, preventing double-booking and disputes.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-950 text-white dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-mono-num shrink-0 ring-1 ring-slate-800 dark:ring-indigo-800">
                04
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      On-Site Encrypted QR Attendance Verification
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-num font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                    REAL-TIME SYNC
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Staff arrive on site and scan the organizer's session QR token. The system verifies that the worker has an accepted contract, logging check-in and check-out timestamps with location tags.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-950 text-white dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-mono-num shrink-0 ring-1 ring-slate-800 dark:ring-indigo-800">
                05
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Audited Ledger Settlement & Portable Trust
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-num font-bold text-indigo-700 dark:text-indigo-300 uppercase bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">
                    DIRECT DISBURSEMENT
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Shift completion transitions payment records from <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending</span> to <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Approved / Paid</span>, creating digital audit trails, instant worker balance crediting, and bilateral review scores.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Start buttons */}
        <div className="text-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              switchRole('ORGANIZER');
              
            }}
            className="shadow-xl shadow-indigo-600/30"
          >
            Launch Live Platform Console →
          </Button>
        </div>
      </div>
    </div>
  );
};

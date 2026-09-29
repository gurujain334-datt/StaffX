import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Activity,
  Award,
  Database,
  Server,
  Lock,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    professionals,
    events,
    assignments,
    payments,
    requirements,
    applications,
    attendance,
    verifyProfessional,
    addToast,
    isBackendLive,
    isSupabaseReady,
    setIsBackendModalOpen,
    isSupabaseConfigured,
    testBackendConnection,
    isCheckingBackend,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'EVENTS' | 'USERS' | 'DATABASE'>('VERIFICATION');

  // Pending verifications
  const pendingPros = professionals.filter(p => p.verificationStatus === 'PENDING');
  const verifiedCount = professionals.filter(p => p.verificationStatus === 'VERIFIED').length;
  const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">StaffX Admin Console</h1>
            <Badge variant="purple" icon={<Activity className="w-3 h-3" />}>
              Platform Governance
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System oversight, worker KYC ID verification, and cloud database infrastructure
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Admin-Only Database Control Button */}
          <Button
            variant="primary"
            size="sm"
            icon={<Database className="w-4 h-4 text-purple-200" />}
            onClick={() => setIsBackendModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
          >
            Database & Cloud Console
          </Button>
        </div>
      </div>

      {/* Admin Infrastructure & Database Control Banner */}
      <Card padding="md" className="border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Database Authority & Infrastructure
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200">
                  Admin Permission Only
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  isBackendLive || isSupabaseReady ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isBackendLive || isSupabaseReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isBackendLive || isSupabaseReady ? 'Live Supabase Connected' : 'Local Resilience Cache'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Full administrative permission to inspect tables, sync schemas, run health diagnostics, and configure production database keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />}
              onClick={async () => {
                const live = await testBackendConnection();
                addToast(live ? 'Database health check: Operational' : 'Database responding via local storage', live ? 'success' : 'info');
              }}
              disabled={isCheckingBackend}
            >
              Check Health
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              onClick={() => setIsBackendModalOpen(true)}
            >
              Open DB Modal
            </Button>
          </div>
        </div>
      </Card>

      {/* 4 Admin Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="border-slate-200 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Pending Verifications</span>
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingPros.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Awaiting KYC document review</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Verified Professionals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {verifiedCount}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">100% ID & Skill Audited</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Active Events</span>
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {events.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Scheduled on platform</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Platform Payroll Volume</span>
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            ₹{totalVolume.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Gross settled wages</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('VERIFICATION')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'VERIFICATION'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-100 dark:hover:text-white'
          }`}
        >
          KYC Verification Queue ({pendingPros.length})
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'EVENTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-100 dark:hover:text-white'
          }`}
        >
          All System Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-100 dark:hover:text-white'
          }`}
        >
          All Workers Directory ({professionals.length})
        </button>
        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DATABASE'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & Cloud Controls</span>
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          {pendingPros.length === 0 ? (
            <Card padding="lg" className="text-center py-12 border-slate-200 dark:border-slate-800 bg-slate-900/80">
              <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Verification Queue is Empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                All event professionals have been verified. Any newly registered candidates will show up here.
              </p>
            </Card>
          ) : (
            pendingPros.map(pro => (
              <Card key={pro.id} padding="md" className="border-slate-200 dark:border-slate-800 bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={pro.profileImage}
                      alt={pro.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{pro.name}</h4>
                        <Badge variant="yellow">{pro.primaryCategory}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{pro.location}</span>
                        <span>•</span>
                        <span>{pro.experienceYears} Years Experience</span>
                        <span>•</span>
                        <span>Requested Rate: ₹{pro.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {pro.skills.map((skill, index) => (
                          <span key={index} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-600 dark:text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => {
                        verifyProfessional(pro.id);
                        addToast(`Verified KYC credentials for ${pro.name}`, 'success');
                      }}
                    >
                      Approve KYC
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: All Events */}
      {activeTab === 'EVENTS' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">QR Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-white">{ev.name}</td>
                    <td className="py-3 px-4 text-slate-300">{ev.venue}, {ev.location}</td>
                    <td className="py-3 px-4 text-slate-300">{ev.startDate}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {ev.qrCodeToken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Workers Directory */}
      {activeTab === 'USERS' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Professional</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Hourly Rate</th>
                  <th className="py-3 px-4">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {professionals.map(pro => (
                  <tr key={pro.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-white">{pro.name}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{pro.primaryCategory}</td>
                    <td className="py-3 px-4 text-slate-300">{pro.location}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">★ {pro.rating}</td>
                    <td className="py-3 px-4 text-white font-semibold font-mono-num">₹{pro.hourlyRate}/hr</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={pro.verificationStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: Database & Cloud Controls (Admin Only) */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="md">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Active Schema Tables</div>
              <div className="text-2xl font-black text-white mt-1">8 Collections</div>
              <p className="text-[11px] text-slate-400 mt-1">Events, Requirements, Applicants, Shifts, Attendance, Pay, Reviews, Profiles</p>
            </Card>

            <Card padding="md">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Database Records</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {events.length + professionals.length + requirements.length + applications.length + assignments.length + attendance.length + payments.length} Rows
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Indexed in Supabase PostgreSQL storage</p>
            </Card>

            <Card padding="md">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Backend Authority</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">SuperAdmin</div>
              <p className="text-[11px] text-slate-400 mt-1">Row-level security policies active</p>
            </Card>
          </div>

          <Card padding="lg" className="border-purple-200 dark:border-purple-900/60 bg-slate-900/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Supabase & Cloud Connection Manager
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect database latency, test API connectivity, and sync local storage with cloud tables
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Database className="w-4 h-4" />}
                onClick={() => setIsBackendModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              >
                Launch Database Console
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Connection Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isBackendLive || isSupabaseReady ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {isBackendLive || isSupabaseReady ? 'Live Supabase' : 'Offline Cached'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSupabaseConfigured()
                    ? 'Connected with Project URL and Anon API key.'
                    : 'Running in local resilient state mode. Configure keys in DB Console.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Admin Privileges</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Granted
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Database controls have been hidden from public and non-admin interfaces per governance policy.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

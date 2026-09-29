import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  UserCheck,
  QrCode,
  CreditCard,
  User,
  Search,
  Briefcase,
  ShieldCheck,
  Building,
  CheckCircle2,
  Award,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole, currentRoute, setCurrentRoute, organizerProfile, currentUser, applications, requirements, setIsBackendModalOpen, isBackendLive, isSupabaseReady } = useApp();

  const pendingAppsCount = applications.filter(a => a.status === 'APPLIED' || a.status === 'SHORTLISTED').length;

  const organizerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events & Staffing', icon: Calendar },
    { id: 'find-staff', label: 'Find Staff', icon: Search, badge: 'AI Match' },
    { id: 'applications', label: 'Applications', icon: FileText, count: pendingAppsCount },
    { id: 'workforce', label: 'Workforce Roster', icon: UserCheck },
    { id: 'attendance', label: 'QR Attendance', icon: QrCode },
    { id: 'payments', label: 'Payments & Escrow', icon: CreditCard },
    { id: 'profile', label: 'Agency Profile', icon: Building },
  ];

  const professionalNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'find-jobs', label: 'Find Gigs & Jobs', icon: Briefcase, count: requirements.length },
    { id: 'my-applications', label: 'My Applications', icon: FileText },
    { id: 'my-assignments', label: 'My Shifts & Work', icon: Calendar },
    { id: 'attendance', label: 'QR Check-in', icon: QrCode },
    { id: 'earnings', label: 'Earnings & Payouts', icon: CreditCard },
    { id: 'profile', label: 'Profile & Portfolio', icon: User },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-verifications', label: 'Verification Queue', icon: ShieldCheck, badge: 'KYC' },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'events', label: 'All Events', icon: Calendar },
  ];

  let currentNavItems = organizerNavItems;
  if (activeRole === 'PROFESSIONAL') currentNavItems = professionalNavItems;
  if (activeRole === 'ADMIN') currentNavItems = adminNavItems;

  return (
    <aside className="w-64 bg-slate-950/75 backdrop-blur-md border-r border-slate-800/60 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role identity banner */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-800/30">
        <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          <span>{activeRole} Portal</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <div className="text-sm font-semibold text-white truncate mt-1">
          {activeRole === 'ORGANIZER' && (organizerProfile.organizationName || 'Event Organizer')}
          {activeRole === 'PROFESSIONAL' && (currentUser?.fullName || 'Event Professional')}
          {activeRole === 'ADMIN' && 'Platform Governance'}
        </div>
        {activeRole === 'ORGANIZER' && (
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Organizer</span>
          </div>
        )}
        {activeRole === 'PROFESSIONAL' && (
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Talent</span>
          </div>
        )}
      </div>

      {/* Navigation items */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-900/20 text-white'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-slate-900/20 text-white'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        {/* Database item directly in nav for ADMIN ONLY */}
        {activeRole === 'ADMIN' && (
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/40 mt-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Database Console</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendLive || isSupabaseReady ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-amber-400'
              }`}
            />
          </button>
        )}
      </nav>

      {/* Bottom helper card */}
      {activeRole === 'ADMIN' ? (
        <div className="p-3 m-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-purple-900 dark:text-purple-200 mb-1">
            <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Database Security</span>
          </div>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-300/70 mb-2">
            Admin exclusive: Supabase schema sync, storage & telemetry tools.
          </p>
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs text-center text-[11px] transition-colors cursor-pointer"
          >
            Manage Database
          </button>
        </div>
      ) : (
        <div className="p-3 m-3 rounded-xl bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="font-semibold text-slate-200 mb-1">Need on-site support?</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            StaffX fast-track dispatch is available 24/7.
          </p>
          <button
            onClick={() => setCurrentRoute('find-staff')}
            className="w-full py-1.5 px-2 bg-slate-900 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-900 dark:hover:bg-slate-600 text-center text-[11px] transition-colors"
          >
            Request Urgent Crew
          </button>
        </div>
      )}
    </aside>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Search,
  CreditCard,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentRoute, setCurrentRoute, activeRole } = useApp();

  const isPublicRoute = ['landing', 'how-it-works', 'about', 'login', 'register'].includes(currentRoute);
  if (isPublicRoute) return null;

  const isPro = activeRole === 'PROFESSIONAL';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: currentRoute === 'dashboard',
    },
    {
      id: isPro ? 'find-jobs' : 'events',
      label: isPro ? 'Jobs' : 'Events',
      icon: Calendar,
      isActive: currentRoute === 'events' || currentRoute === 'find-jobs',
    },
    {
      id: isPro ? 'my-assignments' : 'workforce',
      label: isPro ? 'Shifts' : 'Crew',
      icon: Users,
      isActive: currentRoute === 'workforce' || currentRoute === 'my-assignments' || currentRoute === 'attendance',
    },
    {
      id: isPro ? 'my-applications' : 'applications',
      label: isPro ? 'Applications' : 'Hiring',
      icon: Search,
      isActive: currentRoute === 'applications' || currentRoute === 'my-applications' || currentRoute === 'find-staff',
    },
    {
      id: isPro ? 'earnings' : 'payments',
      label: isPro ? 'Earnings' : 'Escrow',
      icon: CreditCard,
      isActive: currentRoute === 'payments' || currentRoute === 'earnings' || currentRoute === 'admin-dashboard',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                item.isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-100 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

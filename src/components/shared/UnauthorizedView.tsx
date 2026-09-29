import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldAlert, ArrowRight, LogIn, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../../types';

interface UnauthorizedViewProps {
  requiredRole?: UserRole | 'AUTHENTICATED' | string;
  attemptedRoute?: string;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  requiredRole = 'AUTHENTICATED',
  attemptedRoute,
}) => {
  const { currentUser, currentRoute, setCurrentRoute, logoutUser, activeRole } = useApp();

  const isNotLoggedIn = !currentUser;

  const getRolePortalName = (role?: string) => {
    if (role === 'ORGANIZER') return 'Organizer Portal';
    if (role === 'PROFESSIONAL') return 'Professional Portal';
    if (role === 'ADMIN') return 'Admin Governance Console';
    return 'Secure Member Area';
  };

  const getTargetDashboard = () => {
    if (activeRole === 'ORGANIZER') return 'dashboard';
    if (activeRole === 'PROFESSIONAL') return 'dashboard';
    return 'dashboard';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <Card padding="lg" className="max-w-lg w-full text-center border-slate-200/90 dark:border-slate-800 bg-slate-900/90 shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider font-mono-num mb-2">
          Role Guard Enforcement
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          {isNotLoggedIn ? 'Authentication Required' : 'Access Restricted'}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          {isNotLoggedIn ? (
            <>
              You must be logged in to view{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200">
                {attemptedRoute || currentRoute}
              </code>
              . Please sign in with your credentials or register for an account.
            </>
          ) : (
            <>
              The view{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200">
                {attemptedRoute || currentRoute}
              </code>{' '}
              is restricted to{' '}
              <strong className="text-white font-semibold">
                {getRolePortalName(requiredRole)}
              </strong>
              . Your active session is currently authenticated as an{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                {currentUser.role}
              </strong>
              .
            </>
          )}
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isNotLoggedIn ? (
            <>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                icon={<LogIn className="w-4 h-4" />}
                onClick={() => setCurrentRoute('login')}
              >
                Log In to Account
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setCurrentRoute('register')}
              >
                Create Account
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                icon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => setCurrentRoute(getTargetDashboard())}
              >
                Return to {(activeRole || 'User').toLowerCase()} Dashboard
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                onClick={logoutUser}
              >
                Switch Account
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

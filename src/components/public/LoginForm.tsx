import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Mail, Lock, Users, Briefcase, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { loginUser, setCurrentRoute, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ORGANIZER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotNotice, setShowForgotNotice] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loginUser(email, role, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: UserRole, targetEmail: string) => {
    setEmail(targetEmail);
    setRole(targetRole);
    setError(null);
    setIsLoading(true);
    try {
      await loginUser(targetEmail, targetRole, 'password123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-900 dark:bg-transparent">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Log in to StaffX</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Access your event staffing dashboard and assignments</p>
        </div>

        <Card padding="lg" className="border-slate-200 dark:border-slate-800 bg-slate-900/90 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg">
                {error}
              </div>
            )}

            {showForgotNotice && (
              <div className="p-3 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <span>
                  Password recovery: Enter your registered email and an automated Supabase magic reset token will be delivered to your inbox, or select one of the 1-click test evaluation profiles below.
                </span>
              </div>
            )}

            {/* Role Tab selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('ORGANIZER');
                    setEmail('organizer@staffx.com');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    role === 'ORGANIZER'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Organizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('PROFESSIONAL');
                    setEmail('rahul@staffx.com');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    role === 'PROFESSIONAL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentRoute('admin-login')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-lg border border-purple-800/60 bg-purple-950/30 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all cursor-pointer"
                  title="Switch to Admin Login Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <Input
              label="Email or Username"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. guru, harshit, satwik, or user@staffx.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2 shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? 'Authenticating...' : 'Log In'}
            </Button>
          </form>

          {/* 1-Click Fast Evaluation Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center mb-3">
              1-Click Test Logins (Guru, Harshit, Satwik)
            </span>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('ORGANIZER', 'guru@staffx.com')}
                disabled={isLoading}
                className="p-2 rounded-lg border border-indigo-500/30 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center justify-between">
                  <span>👔 Guru</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Organizer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('PROFESSIONAL', 'harshit@staffx.com')}
                disabled={isLoading}
                className="p-2 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-300 flex items-center justify-between">
                  <span>🧑‍💼 Harshit</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Security Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('PROFESSIONAL', 'satwik@staffx.com')}
                disabled={isLoading}
                className="p-2 rounded-lg border border-amber-500/30 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center justify-between">
                  <span>⚡ Satwik</span>
                  <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Event Lead</div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('ORGANIZER', 'organizer@staffx.com')}
                disabled={isLoading}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-800/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>👔 Demo Org</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Apex Events</div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentRoute('admin-login')}
                disabled={isLoading}
                className="p-2 rounded-lg border border-purple-800/60 hover:border-purple-500 bg-purple-950/20 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-purple-300 dark:text-purple-300 flex items-center justify-between">
                  <span>🛡️ Admin</span>
                  <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-purple-400/80 truncate">System Portal</div>
              </button>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p>
            Don't have an account yet?{' '}
            <button
              onClick={() => setCurrentRoute('register')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Create account here
            </button>
          </p>
          <p className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <span className="text-slate-400">StaffX Platform Administrator? </span>
            <button
              onClick={() => setCurrentRoute('admin-login')}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Access Admin Portal</span>
              <ArrowRight className="w-3 h-3 inline" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

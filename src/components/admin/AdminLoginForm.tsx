import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminLoginForm: React.FC = () => {
  const { loginUser, setCurrentRoute, addToast } = useApp();
  const [email, setEmail] = useState('admin@staffx.com');
  const [password, setPassword] = useState('adminpassword123');
  const [securityKey, setSecurityKey] = useState('STAFFX-SEC-2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Admin email and master password are required.');
      return;
    }

    setIsLoading(true);
    try {
      // Validate that it's an admin email
      if (!email.toLowerCase().includes('admin') && email.toLowerCase() !== 'moderator@staffx.com') {
        setError('Unauthorized: This portal is strictly restricted to StaffX platform administrators.');
        setIsLoading(false);
        return;
      }

      const res = await loginUser(email, 'ADMIN', password);
      if (res.success) {
        addToast('Admin security session verified. Welcome to StaffX Governance Console.', 'success', 'Admin Authenticated');
        setCurrentRoute('admin-dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials. Please check your login details.');
      }
    } catch {
      setError('An error occurred during administrator authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setEmail('admin@staffx.com');
    setPassword('adminpassword123');
    setSecurityKey('STAFFX-SEC-2026');
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginUser('admin@staffx.com', 'ADMIN', 'adminpassword123');
      if (res.success) {
        addToast('Admin security session verified. Welcome to StaffX Governance Console.', 'success', 'Admin Authenticated');
        setCurrentRoute('admin-dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-transparent relative z-10">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link & Telemetry Badge */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentRoute('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to StaffX Home</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/80 text-[11px] font-mono-num text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>RESTRICTED // L4 SEC</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-600/30 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Portal Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Authorized access only for platform administrators, security controllers & KYC auditors.
          </p>
        </div>

        {/* Form Card */}
        <Card
          padding="lg"
          className="border-slate-800/90 bg-slate-900/90 dark:bg-[#070e1e]/95 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500" />

          {/* Security Notice */}
          <div className="mb-5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Admin Security Clearance Required.</strong> Database configuration and user compliance permissions are strictly granted to verified administrative accounts.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Administrator Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@staffx.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Master Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Admin Security Clearance Key"
              type="text"
              value={securityKey}
              onChange={e => setSecurityKey(e.target.value)}
              placeholder="STAFFX-SEC-2026"
              leftIcon={<Key className="w-4 h-4" />}
              helperText="Internal infrastructure verification token"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {isLoading ? 'Verifying Admin Credentials...' : 'Authenticate as Administrator'}
            </Button>
          </form>

          {/* Quick 1-Click Evaluation for Admin */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center mb-2.5">
              Authorized Evaluation Shortcut
            </span>
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={isLoading}
              className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-left transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Platform Administrator Access
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    admin@staffx.com (Full System & Database Access)
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Card>

        {/* Footnote */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>
            Standard event organizer or talent?{' '}
            <button
              onClick={() => setCurrentRoute('login')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Go to Standard Login
            </button>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Database className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Database configuration permission is restricted to admin portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

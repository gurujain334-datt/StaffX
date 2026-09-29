import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  checkSupabaseHealth,
  isSupabaseConfigured,
  getResolvedSupabaseUrl,
  getResolvedSupabaseAnonKey,
  getResolvedSupabaseProjectId,
  normalizeSupabaseUrl,
  resetSupabaseClient,
} from '../../services/supabaseClient';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Server,
  Shield,
  FileCode,
  HardDrive,
  ExternalLink,
  Settings,
  X,
  Key,
  Globe,
} from 'lucide-react';
import rawSchemaSql from '../../../supabase/schema.sql?raw';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({ isOpen, onClose }) => {
  const { addToast, activeRole, currentUser, checkBackend } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'schema' | 'instructions'>('status');

  // Input states for credential configuration
  const [urlInput, setUrlInput] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');

  const activeProjectId = getResolvedSupabaseProjectId();
  const activeUrl = getResolvedSupabaseUrl();
  const activeKey = getResolvedSupabaseAnonKey();

  useEffect(() => {
    if (isOpen) {
      setUrlInput(activeUrl);
      setKeyInput(activeKey);
    }
  }, [isOpen]);

  const [healthStatus, setHealthStatus] = useState<{
    configured: boolean;
    connected: boolean;
    latencyMs?: number;
    message: string;
  }>({
    configured: isSupabaseConfigured(),
    connected: false,
    message: 'Click Test Connection to verify live Supabase connectivity.',
  });

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkSupabaseHealth();
      setHealthStatus(res);
      await checkBackend();
      if (res.connected) {
        addToast(`Supabase PostgreSQL is connected! (${res.latencyMs}ms)`, 'success', 'Backend Online');
      } else if (res.configured) {
        addToast(`Supabase endpoint reachable: ${res.message}`, 'warning', 'Connection Check');
      } else {
        addToast('Running in local demo & offline fallback mode. Database types and schemas ready.', 'info', 'Demo Mode');
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeSupabaseUrl(urlInput);
    if (!normalized) {
      addToast('Please enter a valid Supabase URL or Project Reference ID (e.g. gbioimitsenzssoxfqzg)', 'error', 'Invalid URL');
      return;
    }

    try {
      localStorage.setItem('staffx_supabase_url', normalized);
      localStorage.setItem('staffx_supabase_anon_key', keyInput.trim());
      resetSupabaseClient();
      addToast(`Updated Supabase connection endpoint: ${normalized}`, 'success', 'Credentials Saved');
      await runHealthCheck();
    } catch {
      addToast('Failed to save credentials to browser storage.', 'error');
    }
  };

  const handleResetCredentials = async () => {
    localStorage.removeItem('staffx_supabase_url');
    localStorage.removeItem('staffx_supabase_anon_key');
    resetSupabaseClient();
    setUrlInput(getResolvedSupabaseUrl());
    setKeyInput(getResolvedSupabaseAnonKey());
    addToast('Reset Supabase configuration to default project.', 'info', 'Reset Complete');
    await runHealthCheck();
  };

  const copySchemaToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rawSchemaSql);
      setCopiedSchema(true);
      addToast('Supabase SQL Schema & RLS policies copied to clipboard!', 'success', 'Copied');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch {
      addToast('Failed to copy schema to clipboard.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Supabase Backend Foundation
                </h3>
                <Badge variant={healthStatus.connected ? 'success' : healthStatus.configured ? 'warning' : 'neutral'}>
                  {healthStatus.connected ? 'PostgreSQL Live' : healthStatus.configured ? 'Configured' : 'Offline / Demo'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Project Ref: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activeProjectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-900/30 dark:bg-slate-900/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Connectivity & Status
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Configure Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Database Tables & RLS (11 Tables)
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-sm">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Live Connection Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  healthStatus.connected
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : healthStatus.configured
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {healthStatus.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm mb-1">
                    {healthStatus.connected
                      ? 'Live PostgreSQL Database Connected'
                      : healthStatus.configured
                      ? 'Supabase Endpoint Resolved'
                      : 'Running in Local Offline Fallback Mode'}
                  </div>
                  <p className="leading-relaxed opacity-90">{healthStatus.message}</p>
                  {healthStatus.latencyMs !== undefined && (
                    <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] bg-black/10 dark:bg-slate-900/10 px-2 py-0.5 rounded">
                      <span>Server Round-trip:</span>
                      <strong>{healthStatus.latencyMs} ms</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-800/30">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Server className="w-3.5 h-3.5" />
                    <span>Active Endpoint</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white truncate" title={activeUrl}>
                    {activeUrl}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                    Normalized URL Valid
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-800/30">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Auth & Security</span>
                  </div>
                  <div className="font-bold text-white">Supabase Auth</div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                    Strict RBAC & RLS Enabled
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-800/30">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Project Ref</span>
                  </div>
                  <div className="font-mono font-bold text-white truncate">
                    {activeProjectId}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    PostgreSQL 15+
                  </div>
                </div>
              </div>

              {/* Active Session Info */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-800/20 space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Current Session Context
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Logged-in User:</span>
                    <span className="font-semibold text-slate-200">
                      {currentUser?.fullName || 'Guest / Unauthenticated'} ({currentUser?.email || 'No active session'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Active Portal Role:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {activeRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Connect Any Supabase Project Directly
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  You can enter your Supabase Project ID (e.g. <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">gbioimitsenzssoxfqzg</code>) or complete URL (<code className="font-mono text-indigo-600 dark:text-indigo-400">https://gbioimitsenzssoxfqzg.supabase.co</code>) below along with your Anon API key.
                </p>
              </div>

              <Input
                label="Supabase URL or Project ID"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="gbioimitsenzssoxfqzg or https://gbioimitsenzssoxfqzg.supabase.co"
                leftIcon={<Globe className="w-4 h-4" />}
                helperText="Formatted automatically: accepts 'gbioimitsenzssoxfqzg', 'gbioimitsenzssoxfqzg.supabase.co', or full HTTPS URL"
                required
              />

              <Input
                label="Supabase Anon / Public API Key"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="sb_publishable_... or eyJhbGciOi..."
                leftIcon={<Key className="w-4 h-4" />}
                helperText="Found under Project Settings > API > Project API keys in your Supabase dashboard"
                required
              />

              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetCredentials}
                >
                  Reset Defaults
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="shadow-md shadow-indigo-600/20"
                >
                  Save Credentials & Reconnect
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Normalized schema created in <code className="font-mono text-indigo-500">/supabase/schema.sql</code> with complete Row Level Security policies.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySchemaToClipboard}
                  className="gap-2 shrink-0"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied' : 'Copy SQL Script'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'profiles', rls: 'Public Read, Self Update', desc: 'Extended auth user profiles' },
                  { name: 'organizer_profiles', rls: 'Public Read, Organizer Write', desc: 'Agencies, planners & verification' },
                  { name: 'professional_profiles', rls: 'Public Read, Staff Write', desc: 'Hourly rates, skills & badges' },
                  { name: 'events', rls: 'Public Read, Organizer Write', desc: 'Schedules, venues & QR tokens' },
                  { name: 'staffing_requirements', rls: 'Public Read, Organizer Write', desc: 'Roles, pay & quantity quotas' },
                  { name: 'applications', rls: 'Staff/Organizer Isolated', desc: 'Role candidate applications' },
                  { name: 'assignments', rls: 'Organizer/Staff Isolated', desc: 'Confirmed hiring contracts' },
                  { name: 'attendance_records', rls: 'Participant Isolated', desc: 'QR code scans & GPS check-ins' },
                  { name: 'payment_records', rls: 'Participant Isolated', desc: 'Escrow disbursements & payouts' },
                  { name: 'reviews', rls: 'Public Read, Reviewer Write', desc: 'Post-event 2-way ratings' },
                  { name: 'notifications', rls: 'Strict Recipient Only', desc: 'In-app transaction alerts' },
                ].map((tbl, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-800/30 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        public.{tbl.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold">
                        RLS Enabled
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{tbl.desc}</p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                      Policy: {tbl.rls}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Connected Supabase Project
                  </h4>
                  <a
                    href={`https://supabase.com/dashboard/project/${activeProjectId}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Supabase SQL Editor <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Your project credentials have been configured. Follow these quick steps to execute the tables in your Supabase backend:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                  <li>
                    Click the <strong>"Copy SQL Script"</strong> button below to copy the complete schema with 11 tables and RLS security policies.
                  </li>
                  <li>
                    Open your Supabase project dashboard at{' '}
                    <a
                      href={`https://supabase.com/dashboard/project/${activeProjectId}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-500 hover:underline font-semibold"
                    >
                      supabase.com/dashboard/project/{activeProjectId}/sql/new
                    </a>
                  </li>
                  <li>
                    Paste the copied SQL into the editor and click <strong>"Run"</strong> (or press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">Ctrl/Cmd + Enter</kbd>).
                  </li>
                  <li>
                    Return here and click <strong>"Test Connection"</strong>. All form submissions (events, job applications, hiring, check-ins, payments) will automatically persist directly to your Supabase tables!
                  </li>
                </ol>

                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={copySchemaToClipboard}
                    className="gap-2"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy SQL Schema (All 11 Tables)'}</span>
                  </Button>
                </div>

                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto space-y-1">
                  <div># Active Connection Endpoint</div>
                  <div>VITE_SUPABASE_URL={activeUrl}</div>
                  <div>VITE_SUPABASE_ANON_KEY={activeKey.slice(0, 15)}...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={runHealthCheck}
            disabled={isChecking}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Testing...' : 'Test Connection'}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};


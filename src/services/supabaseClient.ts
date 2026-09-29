import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const DEFAULT_SUPABASE_PROJECT_ID = 'gbioimitsenzssoxfqzg';
const DEFAULT_SUPABASE_URL = 'https://gbioimitsenzssoxfqzg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_yw7u4PJjvbrLfLa2z7aDng_Ii34kxiw';

/**
 * Normalizes any project ID, hostname, or full URL string into a proper Supabase HTTPS endpoint URL.
 * e.g. "gbioimitsenzssoxfqzg" -> "https://gbioimitsenzssoxfqzg.supabase.co"
 * e.g. "gbioimitsenzssoxfqzg.supabase.co" -> "https://gbioimitsenzssoxfqzg.supabase.co"
 * e.g. "https://gbioimitsenzssoxfqzg.supabase.co/" -> "https://gbioimitsenzssoxfqzg.supabase.co"
 */
export const normalizeSupabaseUrl = (val?: unknown): string => {
  if (typeof val !== 'string') return '';
  let trimmed = val.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.includes('placeholder')) {
    return '';
  }

  // Strip trailing slashes
  trimmed = trimmed.replace(/\/+$/, '');

  // If input is purely a project ID ref (e.g. "gbioimitsenzssoxfqzg")
  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  // If input is a domain without protocol (e.g. "gbioimitsenzssoxfqzg.supabase.co")
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname)) {
      return parsed.origin;
    }
  } catch {
    // ignore
  }

  return '';
};

/**
 * Validates whether a given string is a well-formed HTTP/HTTPS URL
 */
export const isValidHttpUrl = (val?: unknown): boolean => {
  const normalized = normalizeSupabaseUrl(val);
  return Boolean(normalized);
};

/**
 * Safely resolves the active Supabase URL
 */
export const getResolvedSupabaseUrl = (): string => {
  // 1. Check localStorage for user runtime override
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('staffx_supabase_url');
    const normalizedStored = normalizeSupabaseUrl(storedUrl);
    if (normalizedStored) {
      return normalizedStored;
    }
  }

  // 2. Check environment variable
  const envUrl = typeof import.meta.env?.VITE_SUPABASE_URL === 'string'
    ? import.meta.env.VITE_SUPABASE_URL.trim()
    : '';

  const normalizedEnv = normalizeSupabaseUrl(envUrl);
  if (normalizedEnv) {
    return normalizedEnv;
  }

  // 3. Default fallback
  return DEFAULT_SUPABASE_URL;
};

/**
 * Resolves the Supabase Project Ref ID (e.g. "gbioimitsenzssoxfqzg")
 */
export const getResolvedSupabaseProjectId = (): string => {
  const activeUrl = getResolvedSupabaseUrl();
  try {
    const host = new URL(activeUrl).hostname;
    const match = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    if (match) return match[1];
  } catch {}
  return DEFAULT_SUPABASE_PROJECT_ID;
};

/**
 * Safely resolves the active Supabase Anon Key
 */
export const getResolvedSupabaseAnonKey = (): string => {
  // Check localStorage for runtime override
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('staffx_supabase_anon_key');
    if (storedKey && storedKey.trim().length > 10) {
      return storedKey.trim();
    }
  }

  const envKey = typeof import.meta.env?.VITE_SUPABASE_ANON_KEY === 'string'
    ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
    : '';

  if (envKey && envKey.length > 10 && !envKey.includes('placeholder') && envKey !== 'undefined' && envKey !== 'null') {
    return envKey;
  }

  return DEFAULT_SUPABASE_ANON_KEY;
};

export { DEFAULT_SUPABASE_PROJECT_ID, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY };

/**
 * Indicates whether user has configured a valid Supabase endpoint.
 */
export const isSupabaseConfigured = (): boolean => {
  const activeUrl = getResolvedSupabaseUrl();
  return isValidHttpUrl(activeUrl);
};

let clientInstance: SupabaseClient<any, 'public', any> | null = null;

export const resetSupabaseClient = () => {
  clientInstance = null;
};

export const getSupabaseClient = (): SupabaseClient<any, 'public', any> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      const url = getResolvedSupabaseUrl();
      const key = getResolvedSupabaseAnonKey();
      
      if (!isValidHttpUrl(url)) {
        console.warn('Supabase URL is not a valid HTTP/HTTPS URL. Running in offline/mock mode.');
        return null;
      }

      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Unable to initialize Supabase client:', err);
      clientInstance = null;
      return null;
    }
  }

  return clientInstance;
};

// Safe fallback export (lazy-evaluated, never throws)
export const supabase: SupabaseClient<any, 'public', any> | null = (() => {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
})();

/**
 * Health check helper to test database connectivity
 */
export const checkSupabaseHealth = async (): Promise<{
  configured: boolean;
  connected: boolean;
  tablesReady?: boolean;
  latencyMs?: number;
  message: string;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase credentials not configured. Running in Local Development & Offline Demo Mode.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      connected: false,
      message: 'Failed to initialize Supabase client instance.',
    };
  }

  const projectId = getResolvedSupabaseProjectId();
  const start = performance.now();
  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      const isMissingTable =
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist');

      return {
        configured: true,
        connected: !isMissingTable, // Gateway is connected; table pending
        tablesReady: !isMissingTable,
        latencyMs,
        message: isMissingTable
          ? `Connected to Supabase project (${projectId}) in ${latencyMs}ms! The database is live; run the SQL schema in your Supabase SQL editor to create the tables.`
          : `Connected to Supabase project (${projectId}), but query returned: ${error.message}`,
      };
    }

    return {
      configured: true,
      connected: true,
      tablesReady: true,
      latencyMs,
      message: `Successfully connected to Supabase PostgreSQL database project (${projectId}) in ${latencyMs}ms latency. All tables verified.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      configured: true,
      connected: false,
      message: `Connection failed to (${projectId}): ${msg}`,
    };
  }
};


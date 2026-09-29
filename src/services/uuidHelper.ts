/**
 * Utility for UUID validation and safe fallback handling in Supabase queries
 */
export const isValidUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
};

/**
 * Generate a standard UUID v4
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Convert any string (e.g. 'usr-org-guru', 'guru@staffx.com') into a valid UUID
 */
export const toValidUUID = (str?: string | null): string => {
  if (isValidUUID(str)) return str!.trim();
  const safeStr = (str || '').trim().toLowerCase() || generateUUID();
  
  // Deterministic 32-hex string generator
  let h1 = 0x811c9dc5;
  let h2 = 0xc2b2ae35;
  for (let i = 0; i < safeStr.length; i++) {
    const code = safeStr.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ code, 0x01000197);
  }
  const hex1 = Math.abs(h1).toString(16).padStart(8, '0');
  const hex2 = Math.abs(h2).toString(16).padStart(8, '0');
  const hex3 = Math.abs(h1 ^ h2).toString(16).padStart(8, '0');
  const hex4 = Math.abs(h1 + h2).toString(16).padStart(8, '0');
  const full = (hex1 + hex2 + hex3 + hex4).substring(0, 32);

  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-8${full.slice(17, 20)}-${full.slice(20, 32)}`;
};

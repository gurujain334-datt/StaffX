export type ColorTheme = 'cyan' | 'violet' | 'emerald' | 'amber' | 'indigo';

export interface ThemeDefinition {
  id: ColorTheme;
  name: string;
  tagline: string;
  primaryHex: string;
  hoverHex: string;
  accentRgb: string;
  gradient: string;
  glowRgba: string;
  dotColor: string;
}

export const COLOR_THEMES: Record<ColorTheme, ThemeDefinition> = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    tagline: 'Futuristic Neo-Tokyo & Electric Aqua',
    primaryHex: '#06b6d4',
    hoverHex: '#0891b2',
    accentRgb: '6, 182, 212',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    glowRgba: 'rgba(6, 182, 212, 0.45)',
    dotColor: '#06b6d4'
  },
  violet: {
    id: 'violet',
    name: 'Quantum Violet',
    tagline: 'Deep Cyberpunk & Holographic Neon',
    primaryHex: '#8b5cf6',
    hoverHex: '#7c3aed',
    accentRgb: '139, 92, 246',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    glowRgba: 'rgba(139, 92, 246, 0.45)',
    dotColor: '#8b5cf6'
  },
  emerald: {
    id: 'emerald',
    name: 'Matrix Emerald',
    tagline: 'High-Tech Digital Bio & Cyber Mint',
    primaryHex: '#10b981',
    hoverHex: '#059669',
    accentRgb: '16, 185, 129',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    glowRgba: 'rgba(16, 185, 129, 0.45)',
    dotColor: '#10b981'
  },
  amber: {
    id: 'amber',
    name: 'Solaris Amber',
    tagline: 'Hyper Plasma Gold & Solar Energy',
    primaryHex: '#f59e0b',
    hoverHex: '#d97706',
    accentRgb: '245, 158, 11',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    glowRgba: 'rgba(245, 158, 11, 0.45)',
    dotColor: '#f59e0b'
  },
  indigo: {
    id: 'indigo',
    name: 'Cosmic Indigo',
    tagline: 'Aerospace Quantum & Deep Space Tech',
    primaryHex: '#6366f1',
    hoverHex: '#4f46e5',
    accentRgb: '99, 102, 241',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glowRgba: 'rgba(99, 102, 241, 0.45)',
    dotColor: '#6366f1'
  }
};

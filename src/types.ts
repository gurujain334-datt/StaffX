export * from './types/index';

export interface OpticalMaterial {
  id: string;
  name: string;
  formula: string;
  category: string;
  ior: number;          // Refractive index at 587.6 nm (d line)
  abbe: number;         // Abbe number V_d
  roughness: number;    // Surface micro-roughness
  absorption: number;   // Linear absorption coefficient
  filmNm: number;       // Anti-reflective coating thickness in nm
  bevelMm: number;      // Ground bevel facet width in mm
  description: string;
  accentColor?: string;
}

export interface WorkbenchParams {
  ior: number;
  abbe: number;
  roughness: number;
  absorption: number;
  film: number;
  bevel: number;
}

export interface DispersionRayData {
  incidentAngleDeg: number;
  refractiveIndices: {
    F: number; // 486.1 nm Blue
    d: number; // 587.6 nm Yellow
    C: number; // 656.3 nm Red
  };
  refractionAnglesDeg: {
    F: number;
    d: number;
    C: number;
  };
  angularSpreadMrad: number;
}

export type ExportFormat = 'glsl' | 'materialx' | 'usd' | 'gltf';

export interface FieldNoteItem {
  id: string;
  quote: string;
  metricValue: string;
  metricLabel: string;
  author: string;
  role: string;
  company: string;
  avatarSeed: number;
}

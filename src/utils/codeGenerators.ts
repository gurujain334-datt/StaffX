import { WorkbenchParams } from '../types';

export function generateGLSL(params: WorkbenchParams, materialName: string = 'bk7'): string {
  const iorStr = params.ior.toFixed(4);
  const abbeStr = params.abbe.toFixed(2);
  const roughStr = params.roughness.toFixed(3);
  const absorbStr = params.absorption.toFixed(3);
  const filmStr = params.film.toFixed(1);
  const bevelStr = params.bevel.toFixed(2);

  return `// CAUSTIC Shader Export — ${materialName.toUpperCase()}
// Precision Optical Transmission & Abbe Dispersion Model (GLSL ES 3.00)
#version 300 es
precision highp float;

out vec4 fragColor;

in vec3 vNormal;
in vec3 vViewDir;
in vec3 vWorldPos;

uniform sampler2D uEnvironmentMap;
uniform vec2 uResolution;

// Material authored constants
const float IOR = ${iorStr};
const float ABBE_NUMBER = ${abbeStr};
const float SURFACE_ROUGHNESS = ${roughStr};
const float VOLUME_ABSORPTION = ${absorbStr};
const float COATING_THICKNESS_NM = ${filmStr};
const float BEVEL_RADIUS_MM = ${bevelStr};

// Fresnel-Schlick with variable IOR
float fresnelSchlick(float cosTheta, float ior) {
  float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
  return f0 + (1.0 - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Thin-film interference phase shift approximation
vec3 thinFilmInterference(float thicknessNm, float cosTheta) {
  if (thicknessNm <= 0.0) return vec3(1.0);
  float opd = 2.0 * 1.38 * thicknessNm * cosTheta;
  vec3 phase = (2.0 * 3.14159265 * opd) / vec3(656.3, 587.6, 486.1);
  return 0.5 + 0.5 * cos(phase);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewDir);
  float NdotV = max(dot(N, V), 0.0);

  // Spectral dispersion: calculate wavelength-dependent IORs (C, d, F lines)
  float deltaN = (IOR - 1.0) / max(ABBE_NUMBER, 1.0);
  float iorRed   = IOR - deltaN * 0.5;
  float iorGreen = IOR;
  float iorBlue  = IOR + deltaN * 0.5;

  // Refract each primary spectral ray
  vec3 rayR = refract(-V, N, 1.0 / iorRed);
  vec3 rayG = refract(-V, N, 1.0 / iorGreen);
  vec3 rayB = refract(-V, N, 1.0 / iorBlue);

  // Environmental lookup along dispersed vectors
  float r = texture(uEnvironmentMap, rayR.xy * 0.5 + 0.5).r;
  float g = texture(uEnvironmentMap, rayG.xy * 0.5 + 0.5).g;
  float b = texture(uEnvironmentMap, rayB.xy * 0.5 + 0.5).b;
  vec3 transmitted = vec3(r, g, b);

  // Volumetric Beer-Lambert path attenuation
  float pathLength = 1.0 / max(NdotV, 0.1);
  vec3 attenuation = exp(-vec3(VOLUME_ABSORPTION) * pathLength);
  transmitted *= attenuation;

  // Thin-film coating reflection modulation
  vec3 coatingTint = thinFilmInterference(COATING_THICKNESS_NM, NdotV);
  transmitted *= coatingTint;

  // Reflection specular term
  float F = fresnelSchlick(NdotV, IOR);
  vec3 reflected = texture(uEnvironmentMap, reflect(-V, N).xy * 0.5 + 0.5).rgb;

  vec3 finalColor = mix(transmitted, reflected, F);
  fragColor = vec4(finalColor, 1.0);
}`;
}

export function generateMaterialX(params: WorkbenchParams, materialName: string = 'bk7'): string {
  const iorStr = params.ior.toFixed(4);
  const roughStr = params.roughness.toFixed(3);
  const abbeStr = params.abbe.toFixed(2);
  const filmStr = params.film.toFixed(1);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- CAUSTIC MaterialX 1.39 Optical Shading Network -->
<materialx version="1.39" colorspace="lin_srgb">
  <nodegraph name="NG_Caustic_${materialName}">
    <open_pbr_surface name="caustic_core" type="surfaceshader">
      <!-- Base transmission and index of refraction -->
      <input name="base_weight" type="float" value="0.0" />
      <input name="transmission_weight" type="float" value="1.0" />
      <input name="transmission_color" type="color3" value="0.95, 0.98, 1.0" />
      <input name="transmission_depth" type="float" value="${(1.0 / Math.max(params.absorption, 0.01)).toFixed(2)}" />
      <input name="transmission_dispersion_scale" type="float" value="${(60.0 / Math.max(params.abbe, 1.0)).toFixed(3)}" />
      <input name="specular_roughness" type="float" value="${roughStr}" />
      <input name="specular_ior" type="float" value="${iorStr}" />
      
      <!-- Anti-reflective interference coat -->
      <input name="thin_film_weight" type="float" value="${params.film > 0 ? '1.0' : '0.0'}" />
      <input name="thin_film_thickness" type="float" value="${filmStr}" />
      <input name="thin_film_ior" type="float" value="1.38" />
    </open_pbr_surface>
    <output name="surface_out" type="surfaceshader" nodename="caustic_core" />
  </nodegraph>

  <surfacematerial name="M_${materialName}" type="material">
    <input name="surfaceshader" type="surfaceshader" nodename="NG_Caustic_${materialName}" output="surface_out" />
  </surfacematerial>
</materialx>`;
}

export function generateUSD(params: WorkbenchParams, materialName: string = 'bk7'): string {
  const iorStr = params.ior.toFixed(4);
  const roughStr = params.roughness.toFixed(3);

  return `#usda 1.0
(
    doc = "CAUSTIC Physical Optical Material Specification"
    metersPerUnit = 0.001
    upAxis = "Y"
)

def Material "M_${materialName}"
{
    token outputs:surface.connect = </M_${materialName}/PBRShader.outputs:surface>

    def Shader "PBRShader"
    {
        uniform token info:id = "UsdPreviewSurface"
        float inputs:clearcoat = 1.0
        float inputs:clearcoatRoughness = 0.03
        color3f inputs:diffuseColor = (0, 0, 0)
        float inputs:ior = ${iorStr}
        float inputs:metallic = 0.0
        float inputs:opacity = ${(1.0 - params.absorption * 0.2).toFixed(3)}
        float inputs:roughness = ${roughStr}
        float inputs:specular = 1.0
        color3f inputs:specularColor = (1, 1, 1)
        int inputs:useSpecularWorkflow = 1

        # Transmissive extension tokens
        float inputs:transmission = 1.0
        color3f inputs:transmissionColor = (0.92, 0.96, 1.0)
        float inputs:thickness = ${(params.bevel * 2.0).toFixed(2)}

        token outputs:surface
    }
}`;
}

export function generateGLTF(params: WorkbenchParams, materialName: string = 'bk7'): string {
  const iorStr = params.ior.toFixed(4);
  const roughStr = params.roughness.toFixed(3);

  return JSON.stringify({
    "asset": {
      "version": "2.0",
      "generator": "CAUSTIC Real-Time Optics Workbench 2026"
    },
    "materials": [
      {
        "name": `Caustic_${materialName}`,
        "pbrMetallicRoughness": {
          "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
          "metallicFactor": 0.0,
          "roughnessFactor": parseFloat(roughStr)
        },
        "extensions": {
          "KHR_materials_ior": {
            "ior": parseFloat(iorStr)
          },
          "KHR_materials_transmission": {
            "transmissionFactor": 1.0
          },
          "KHR_materials_volume": {
            "thicknessFactor": parseFloat(params.bevel.toFixed(2)),
            "attenuationColor": [0.88, 0.94, 1.0],
            "attenuationDistance": parseFloat((1.0 / Math.max(params.absorption, 0.01)).toFixed(2))
          },
          "KHR_materials_dispersion": {
            "dispersion": parseFloat((50.0 / Math.max(params.abbe, 1.0)).toFixed(4))
          },
          "KHR_materials_clearcoat": {
            "clearcoatFactor": 1.0,
            "clearcoatRoughnessFactor": 0.02
          }
        },
        "doubleSided": true
      }
    ]
  }, null, 2);
}

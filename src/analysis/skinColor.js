import { SKIN_SAMPLING, SKIN_RANGE } from '../data/thresholds.js';
import { LM } from './faceGeometry.js';

// Zonas de piel (índices de landmarks). La frente puede tener pelo o brillo;
// si no coincide con las mejillas, se descarta automáticamente.
export const SKIN_PATCHES = [
  { name: 'Frente', index: 151 },
  { name: 'Mejilla izquierda', index: 50 },
  { name: 'Mejilla derecha', index: 280 },
];

// sRGB (0-255) → CIELAB con blanco de referencia D65.
// Se usa CIELAB porque separa la luminosidad (L*) del color (a*, b*) y porque
// las distancias entre colores se parecen más a lo que percibe el ojo.
export function rgbToLab(r, g, b) {
  const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
  const Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function median(values) {
  const s = [...values].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const medianLab = (labs) => ({
  L: median(labs.map((c) => c.L)),
  a: median(labs.map((c) => c.a)),
  b: median(labs.map((c) => c.b)),
});

// Distancia entre dos colores en CIELAB (ΔE simple)
export const deltaE = (p, q) => Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);

// ¿El color cae en el rango típico de la piel? Descarta pelo oscuro, fondos grises, etc.
export function isSkinLike(lab) {
  const chroma = Math.hypot(lab.a, lab.b);
  const hue = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  return (
    lab.L >= SKIN_RANGE.MIN_L && lab.L <= SKIN_RANGE.MAX_L &&
    chroma >= SKIN_RANGE.MIN_CHROMA &&
    hue >= SKIN_RANGE.MIN_HUE_DEG && hue <= SKIN_RANGE.MAX_HUE_DEG
  );
}

// PASO 1. Lee los píxeles de un círculo y calcula su color representativo.
export function samplePatch(ctx, imgW, imgH, point, radius, name) {
  const cx = point.x * imgW;
  const cy = point.y * imgH;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const x1 = Math.min(imgW, Math.ceil(cx + radius));
  const y1 = Math.min(imgH, Math.ceil(cy + radius));
  const patch = { name, cx, cy, radius, valid: false, used: false, lab: null, rgb: null, keptRatio: 0 };
  if (x1 <= x0 || y1 <= y0) return patch;

  const { data } = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
  const bw = x1 - x0;
  const labs = [];
  const rgbs = [];
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > radius * radius) continue;
      const i = ((y - y0) * bw + (x - x0)) * 4;
      if (data[i + 3] < 250) continue; // ignora píxeles transparentes
      rgbs.push([data[i], data[i + 1], data[i + 2]]);
      labs.push(rgbToLab(data[i], data[i + 1], data[i + 2]));
    }
  }
  if (labs.length < SKIN_SAMPLING.MIN_PIXELS) return patch;

  // PASO 2. Se quitan los píxeles raros (brillos, sombras fuertes, vello, pelo suelto)
  const mL = median(labs.map((c) => c.L));
  const keep = labs.map((c) => Math.abs(c.L - mL) <= SKIN_SAMPLING.L_TOLERANCE);
  const keptLabs = labs.filter((_, i) => keep[i]);
  const keptRgbs = rgbs.filter((_, i) => keep[i]);
  patch.keptRatio = keptLabs.length / labs.length;
  if (patch.keptRatio < SKIN_SAMPLING.MIN_KEPT_RATIO) return patch;

  patch.lab = medianLab(keptLabs);
  patch.rgb = [0, 1, 2].map((k) => Math.round(median(keptRgbs.map((c) => c[k]))));
  patch.valid = isSkinLike(patch.lab);
  return patch;
}

// PASO 3. Combina las zonas: descarta las que no coinciden con las demás
// y usa la mediana del resto como color de la piel.
export function combinePatches(patches) {
  const valid = patches.filter((p) => p.valid);
  const fail = { ok: false, patches, error: 'No pudimos medir el color de tu piel. Usa una foto con buena luz y la cara despejada.' };
  if (valid.length < 2) return fail;

  const ref = medianLab(valid.map((p) => p.lab));
  for (const p of valid) p.used = deltaE(p.lab, ref) <= SKIN_SAMPLING.MAX_PATCH_DELTA_E;
  const used = valid.filter((p) => p.used);
  if (used.length < 2) return fail;

  const warnings = [];
  const ls = used.map((p) => p.lab.L);
  if (Math.max(...ls) - Math.min(...ls) > SKIN_SAMPLING.MAX_L_SPREAD) {
    warnings.push('La luz sobre tu rostro es despareja; el color de la piel puede estar menos preciso.');
  }
  return {
    ok: true,
    patches,
    lab: medianLab(used.map((p) => p.lab)),
    rgb: [0, 1, 2].map((k) => Math.round(median(used.map((p) => p.rgb[k])))),
    warnings,
  };
}

// Función principal: usa los landmarks para ubicar las zonas sobre la foto
export function sampleSkinColor(image, landmarks) {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);

  const l = landmarks[LM.CHEEK_LEFT];
  const r = landmarks[LM.CHEEK_RIGHT];
  const faceWidthPx = Math.hypot((r.x - l.x) * w, (r.y - l.y) * h);
  const radius = SKIN_SAMPLING.PATCH_RADIUS_RATIO * faceWidthPx;

  const patches = SKIN_PATCHES.map((def) => samplePatch(ctx, w, h, landmarks[def.index], radius, def.name));
  return combinePatches(patches);
}
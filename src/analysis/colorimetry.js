import { COLOR_RULES } from '../data/thresholds.js';

// Clasifica la estación a partir del color de la piel en CIELAB ({ L, a, b }).
// Dos ejes, cada uno con su umbral:
//  - Subtono: ángulo de tono h = atan2(b*, a*). Más alto = más amarillo = más cálido.
//  - Profundidad: luminosidad L*. Más alta = piel más clara.
//   cálido + claro → primavera | frío + claro → verano
//   cálido + profundo → otoño  | frío + profundo → invierno
export function classifyColorimetry(lab) {
  const R = COLOR_RULES;
  const hue = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  const warm = hue >= R.WARM_MIN_HUE_DEG;
  const light = lab.L >= R.LIGHT_MIN_L;

  const season = warm ? (light ? 'primavera' : 'otono') : (light ? 'verano' : 'invierno');
  const borderline = {
    undertone: Math.abs(hue - R.WARM_MIN_HUE_DEG) < R.UNDERTONE_MARGIN_DEG,
    depth: Math.abs(lab.L - R.LIGHT_MIN_L) < R.DEPTH_MARGIN_L,
  };
  const reason =
    `Subtono ${warm ? 'cálido' : 'frío'} (ángulo de tono ${hue.toFixed(0)}°) y piel ` +
    `${light ? 'clara' : 'profunda'} (luminosidad L* ${lab.L.toFixed(0)}).`;

  return { season, undertone: warm ? 'cálido' : 'frío', depth: light ? 'clara' : 'profunda', hue, L: lab.L, borderline, reason };
}
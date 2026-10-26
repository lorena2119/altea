import { SEASONS } from '../data/palettes.js';
import { MAKEUP, ACCESSORIES, NECKLINE_TYPES, NECKLINES } from '../data/recommendations.js';
import { STORES } from '../data/stores.js';

const seasonOf = (warm, light) => (warm ? (light ? 'primavera' : 'otono') : (light ? 'verano' : 'invierno'));

const uniqueByName = (list) => list.filter((c, i) => list.findIndex((o) => o.name === c.name) === i);

// Combina la estación (colorimetría) y la forma del rostro (geometría).
//  - Colores de ropa, maquillaje y metales dependen de la estación.
//  - Escotes y cuellos dependen de la forma del rostro.
export function buildRecommendations(color, geometry) {
  const season = color.season;
  const shape = geometry.shape;
  const warm = color.undertone === 'cálido';
  const light = color.depth === 'clara';

  const palette = SEASONS[season];
  const makeup = MAKEUP[season];
  const accessories = ACCESSORIES[season];
  const neck = NECKLINES[shape];

  // Si el subtono está cerca del límite, se muestran los metales de ambos tonos
  let metals = accessories.metals;
  let metalsReason = accessories.reason;
  if (color.borderline.undertone) {
    metals = uniqueByName([...metals, ...ACCESSORIES[seasonOf(!warm, light)].metals]);
    metalsReason = 'Tu subtono está cerca del límite entre cálido y frío, así que te mostramos metales de ambos tonos.';
  }

  // Estaciones vecinas cuando el resultado está cerca de un límite
  const alternatives = [];
  if (color.borderline.undertone) alternatives.push(seasonOf(!warm, light));
  if (color.borderline.depth) alternatives.push(seasonOf(warm, !light));

  const item = (id) => ({ id, label: NECKLINE_TYPES[id] });
  return {
    season,
    shape,
    seasonName: palette.name,
    alternatives: alternatives.map((s) => SEASONS[s].name),
    clothing: { best: palette.best, avoid: palette.avoid },
    makeup: { lips: makeup.lips, blush: makeup.blush, eyes: makeup.eyes, tip: makeup.tip },
    accessories: { primary: accessories.primary, metals, reason: metalsReason },
    necklines: { best: neck.best.map(item), avoid: neck.avoid.map(item), why: neck.why },
    shopping: {
      searches: [
        `labial ${makeup.lips[0].name}`.toLowerCase(),
        `rubor ${makeup.blush[0].name}`.toLowerCase(),
        `sombras ${makeup.eyes[0].name}`.toLowerCase(),
      ],
      stores: STORES,
    },
  };
}
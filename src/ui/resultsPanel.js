import { SEASONS } from '../data/palettes.js';

// ---------- Piezas reutilizables ----------
const dots = (colors) =>
  `<ul class="dots">${colors
    .map((c) => `<li><span style="background:${c.hex}"></span><small>${c.name}</small></li>`)
    .join('')}</ul>`;

// Los metales llevan un brillo para que se lean como metal y no como un color plano
const metalDots = (colors) =>
  `<ul class="dots">${colors
    .map(
      (c) =>
        `<li><span style="background:radial-gradient(circle at 30% 28%, rgba(255,255,255,.8), rgba(255,255,255,0) 55%), ${c.hex}"></span><small>${c.name}</small></li>`
    )
    .join('')}</ul>`;

const card = (title, body) => `<div class="palette-card"><h3>${title}</h3>${body}</div>`;

// Dibujos simples de cada tipo de escote (una prenda vista de frente)
const NECK_SHAPES = {
  v: 'M6 20 L28 10 L40 34 L52 10 L74 20 L68 62 L12 62 Z',
  u: 'M6 20 L28 10 Q28 36 40 36 Q52 36 52 10 L74 20 L68 62 L12 62 Z',
  redondo: 'M6 20 L28 10 Q40 24 52 10 L74 20 L68 62 L12 62 Z',
  cuadrado: 'M6 20 L28 10 L28 26 L52 26 L52 10 L74 20 L68 62 L12 62 Z',
  alto: 'M6 20 L28 10 L28 2 L52 2 L52 10 L74 20 L68 62 L12 62 Z',
  barco: 'M6 20 L16 15 Q40 25 64 15 L74 20 L68 62 L12 62 Z',
};
const neckCard = (item, avoid = false) =>
  `<li class="neck ${avoid ? 'neck--avoid' : ''}">
     <svg viewBox="0 0 80 64" aria-hidden="true"><path d="${NECK_SHAPES[item.id]}"/></svg>
     ${item.label}
   </li>`;

// ---------- Contenido de cada pestaña ----------
const PANES = {
  resumen: ({ geometry, color, skin, reco }) => {
    const season = SEASONS[color.season];
    const r = geometry.ratios;
    const stat = (label, value) => `<div><dt>${label}</dt><dd>${value.toFixed(2)}</dd></div>`;
    const [h, a, b] = [color.hue, skin.lab.a, skin.lab.b];

    const edges = [];
    if (color.borderline.undertone) edges.push('tu subtono está cerca del límite entre cálido y frío');
    if (color.borderline.depth) edges.push('tu piel está cerca del límite entre clara y profunda');
    const warn = edges.length
      ? `<p class="note note--warn">Resultado cercano al límite: ${edges.join(' y ')}. Revisa también la paleta de ${reco.alternatives.join(' y ')}.</p>`
      : '';

    return `
      <div class="summary-grid">
        <section class="stat-card">
          <small class="eyebrow">Forma de tu rostro</small>
          <p class="big">${SHAPE_NAMES[geometry.shape]}</p>
          <p class="muted">${geometry.reason}</p>
          <dl class="mini-stats">
            ${stat('Largo / ancho', r.lengthToWidth)}${stat('Frente / pómulos', r.foreheadToCheek)}
            ${stat('Mandíbula / pómulos', r.jawToCheek)}${stat('Mandíbula / frente', r.jawToForehead)}
          </dl>
        </section>
        <section class="stat-card">
          <small class="eyebrow">Tu colorimetría</small>
          <p class="big">${season.name}</p>
          <p class="muted">${season.summary}</p>
          <div class="chips-row">
            <span class="chip">Subtono ${color.undertone}</span><span class="chip">Piel ${color.depth}</span>
          </div>
          <div class="skin-sample">
            <span class="skin-dot" style="background:${toHex(skin.rgb)}"></span>
            Tono medido · L* ${skin.lab.L.toFixed(0)}, a* ${a.toFixed(0)}, b* ${b.toFixed(0)}, tono ${h.toFixed(0)}°
          </div>
        </section>
      </div>
      ${warn}
      ${card('Tu paleta', dots(reco.clothing.best))}
            <details class="tech">
        <summary>Detalles técnicos</summary>
        <p class="note">Simetría ${geometry.pose.symmetry.toFixed(2)} · Inclinación ${geometry.pose.rollDeg.toFixed(1)}° · Zonas de piel usadas: ${skin.patches.filter((p) => p.used).map((p) => p.name).join(', ')}</p>
      </details>
      <p class="note">Estimación aproximada a partir de una sola foto en 2D. La iluminación, el ángulo y el balance de blancos pueden cambiar el resultado.</p>`;
  },

  ropa: ({ reco }) =>
    card('Colores que te favorecen', dots(reco.clothing.best)) +
    card('Colores menos favorables', dots(reco.clothing.avoid)),

  maquillaje: ({ reco }) =>
    `<div class="cards-grid">
       ${card('Labial', dots(reco.makeup.lips))}
       ${card('Rubor', dots(reco.makeup.blush))}
       ${card('Sombras', dots(reco.makeup.eyes))}
     </div>
     <p class="muted">${reco.makeup.tip}</p>`,

  accesorios: ({ reco }) =>
    card(`Metales · ${reco.accessories.primary}`, metalDots(reco.accessories.metals)) +
    `<p class="muted">${reco.accessories.reason}</p>`,

  escotes: ({ reco }) => {
    const n = reco.necklines;
    return `
      ${card('Escotes y cuellos que te favorecen', `<ul class="neck-grid">${n.best.map((i) => neckCard(i)).join('')}</ul>`)}
      ${n.avoid.length ? card('Mejor evitar', `<ul class="neck-grid">${n.avoid.map((i) => neckCard(i, true)).join('')}</ul>`) : ''}
      <p class="muted">${n.why}</p>
      <p class="note">Son convenciones de estilo, no reglas: prueba lo que te haga sentir cómoda.</p>`;
  },

  tiendas: ({ reco }) => `
    <p class="muted">Prueba buscando:</p>
    <ul class="tags">${reco.shopping.searches.map((q) => `<li>${q}</li>`).join('')}</ul>
    <ul class="stores">${reco.shopping.stores
      .map(
        (s) => `<li><strong>${s.name}</strong><small>${s.note}</small>
          <span class="links">${s.links
            .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`)
            .join('')}</span></li>`
      )
      .join('')}</ul>
    <p class="note">Son sugerencias: no consultamos precios ni existencias, y conviene probar el producto en tu piel.</p>`,
};

const TABS = [
  ['resumen', 'Resumen'],
  ['ropa', 'Ropa'],
  ['maquillaje', 'Maquillaje'],
  ['accesorios', 'Accesorios'],
  ['escotes', 'Escotes'],
  ['tiendas', 'Tiendas'],
];

const SHAPE_NAMES = {
  ovalado: 'Ovalado',
  redondo: 'Redondo',
  cuadrado: 'Cuadrado',
  alargado: 'Alargado / rectangular',
  corazon: 'Corazón',
  diamante: 'Diamante',
};

const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// ---------- API ----------
// data = { geometry, skin, color, reco }
export function renderResults(data) {
  const panel = document.getElementById('results-panel');

  panel.innerHTML = `
    <h2>Tu guía de estilo</h2>
    <div class="tabs" role="tablist">
      ${TABS.map(
        ([id, label], i) =>
          `<button class="tab ${i === 0 ? 'is-active' : ''}" role="tab" id="tab-${id}"
             aria-selected="${i === 0}" aria-controls="pane-${id}" data-tab="${id}">${label}</button>`
      ).join('')}
    </div>
    ${TABS.map(
      ([id], i) =>
        `<section class="pane" role="tabpanel" id="pane-${id}" aria-labelledby="tab-${id}" ${i ? 'hidden' : ''}>${PANES[id](data)}</section>`
    ).join('')}`;

  panel.onclick = (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    panel.querySelectorAll('.tab').forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    panel.querySelectorAll('.pane').forEach((p) => (p.hidden = p.id !== `pane-${tab.dataset.tab}`));
  };

  panel.hidden = false;
}

export function clearResults() {
  const panel = document.getElementById('results-panel');
  panel.hidden = true;
  panel.innerHTML = '';
}
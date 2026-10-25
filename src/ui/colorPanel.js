import { SEASONS } from '../data/palettes.js';

const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

const swatches = (colors) =>
  colors
    .map((c) => `<li><span style="background:${c.hex}"></span><small>${c.name}</small></li>`)
    .join('');

export function renderColorPanel(skin, result) {
  const panel = document.getElementById('color-panel');
  const season = SEASONS[result.season];

  const edges = [];
  if (result.borderline.undertone) edges.push('tu subtono está cerca del límite entre cálido y frío');
  if (result.borderline.depth) edges.push('tu piel está cerca del límite entre clara y profunda');
  const edgeNote = edges.length
    ? `<p class="note note--warn">Resultado cercano al límite: ${edges.join(' y ')}. Otra foto podría dar otra estación.</p>`
    : '';

  const { L, a, b } = skin.lab;
  panel.innerHTML = `
    <h2>Tu colorimetría</h2>
    <p class="shape-name">${season.name}</p>
    <p class="shape-reason">${season.summary}</p>
    <p class="shape-reason">${result.reason}</p>
    <div class="skin-sample">
      <span class="skin-dot" style="background:${toHex(skin.rgb)}"></span>
      Tono de piel medido · L* ${L.toFixed(0)}, a* ${a.toFixed(0)}, b* ${b.toFixed(0)}
    </div>
    ${edgeNote}
    <h3>Colores que te favorecen</h3>
    <ul class="swatches">${swatches(season.best)}</ul>
    <h3>Colores menos favorables</h3>
    <ul class="swatches">${swatches(season.avoid)}</ul>
    <p class="note">Estimación a partir de la piel en una sola foto. La iluminación y el balance de blancos pueden cambiar el resultado; una asesoría profesional también considera cabello y ojos.</p>`;
  panel.hidden = false;
}

export function clearColorPanel() {
  const panel = document.getElementById('color-panel');
  panel.hidden = true;
  panel.innerHTML = '';
}
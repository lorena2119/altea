const SHAPE_NAMES = {
  ovalado: 'Ovalado',
  redondo: 'Redondo',
  cuadrado: 'Cuadrado',
  alargado: 'Alargado / rectangular',
  corazon: 'Corazón',
  diamante: 'Diamante',
};

const RATIO_ROWS = [
  ['lengthToWidth', 'Largo / ancho de pómulos'],
  ['foreheadToCheek', 'Frente / pómulos'],
  ['jawToCheek', 'Mandíbula / pómulos'],
  ['jawToForehead', 'Mandíbula / frente'],
];

export function renderGeometryPanel(g) {
  const panel = document.getElementById('geometry-panel');
  const rows = RATIO_ROWS
    .map(([key, label]) => `<tr><td>${label}</td><td>${g.ratios[key].toFixed(2)}</td></tr>`)
    .join('');

  panel.innerHTML = `
    <h2>Forma de tu rostro</h2>
    <p class="shape-name">${SHAPE_NAMES[g.shape]}</p>
    <p class="shape-reason">${g.reason}</p>
    <table class="ratios"><tbody>${rows}</tbody></table>
    <p class="note">Simetría: ${g.pose.symmetry.toFixed(2)} · Inclinación: ${g.pose.rollDeg.toFixed(1)}°</p>
    <p class="note">Estimación aproximada a partir de puntos 2D de una sola foto. Puede variar con el ángulo, la luz y la expresión.</p>`;
  panel.hidden = false;
}

export function clearGeometryPanel() {
  const panel = document.getElementById('geometry-panel');
  panel.hidden = true;
  panel.innerHTML = '';
}
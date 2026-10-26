// Iconos de línea (24x24). Se colocan automáticamente dentro de cada marcador ".badge",
// según el título que lo acompaña (el <h3> o <strong> de su tarjeta).
const ICONS = {
  rostro: '<ellipse cx="12" cy="12" rx="6.5" ry="8.5"/><circle cx="9.6" cy="10.6" r=".7" fill="currentColor"/><circle cx="14.4" cy="10.6" r=".7" fill="currentColor"/><path d="M9.6 15.2c1.4 1.2 3.4 1.2 4.8 0"/>',
  colorimetria: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.9-.8 1.9-1.7 0-1.2-1-1.6-1-2.7 0-.9.7-1.6 1.7-1.6H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.6" cy="11" r="1"/><circle cx="10.2" cy="7.2" r="1"/><circle cx="15" cy="7.6" r="1"/>',
  maquillaje: '<rect x="9" y="15" width="6" height="6" rx="1"/><rect x="10" y="11" width="4" height="4"/><path d="M10 11V8.5C10 5.5 11.2 4 12 3.5c.8.5 2 2 2 5V11"/>',
  estilo: '<path d="M12 7.5a2.2 2.2 0 1 0-2.2-2.2"/><path d="M12 7.5V9l-8.2 5.6a1 1 0 0 0 .6 1.8h15.2a1 1 0 0 0 .6-1.8L12 9"/>',
  proporciones: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v2"/>',
  piel: '<path d="M12 3.5c3 3.7 5.5 6.4 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.2 2.5-5.9 5.5-9.6z"/>',
};

const BY_TITLE = {
  rostro: 'rostro',
  'forma del rostro': 'rostro',
  colorimetría: 'colorimetria',
  maquillaje: 'maquillaje',
  estilo: 'estilo',
  proporciones: 'proporciones',
  'tono de piel': 'piel',
};

export function decorateBadges() {
  document.querySelectorAll('.badge').forEach((badge) => {
    const title = badge.parentElement.querySelector('h3, strong');
    const key = BY_TITLE[title?.textContent.trim().toLowerCase()];
    if (!key) return;
    badge.classList.add('badge--icon');
    badge.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>`;
  });
}
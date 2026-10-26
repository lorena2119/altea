// Datos editables del motor de recomendaciones.
// Son convenciones habituales de estilo y asesoría de color, no reglas científicas.

// ---- Maquillaje por estación ----
export const MAKEUP = {
  primavera: {
    lips:  [{ name: 'Coral', hex: '#FF7F6B' }, { name: 'Durazno', hex: '#FFB58A' }, { name: 'Rojo tomate', hex: '#E8503A' }, { name: 'Rosa salmón', hex: '#F28B82' }],
    blush: [{ name: 'Durazno', hex: '#FFB58A' }, { name: 'Coral suave', hex: '#F4977F' }],
    eyes:  [{ name: 'Dorado suave', hex: '#D9B26F' }, { name: 'Marrón miel', hex: '#B07A4B' }, { name: 'Verde claro', hex: '#A9C46A' }, { name: 'Turquesa', hex: '#3FC1B0' }],
    tip: 'Acabados luminosos y frescos, con base de subtono cálido.',
  },
  verano: {
    lips:  [{ name: 'Rosa palo', hex: '#D9899F' }, { name: 'Frambuesa suave', hex: '#C75C86' }, { name: 'Malva', hex: '#B58BA5' }, { name: 'Rosa nude', hex: '#D8A1A8' }],
    blush: [{ name: 'Rosa frío', hex: '#E4A5B8' }, { name: 'Rosa pálido', hex: '#E8B8C4' }],
    eyes:  [{ name: 'Gris topo', hex: '#8E8088' }, { name: 'Lavanda', hex: '#B9A6D8' }, { name: 'Azul grisáceo', hex: '#8E9BB0' }, { name: 'Ciruela suave', hex: '#7A4E6E' }],
    tip: 'Acabados suaves y difuminados, con base de subtono frío o neutro.',
  },
  otono: {
    lips:  [{ name: 'Terracota', hex: '#C8643B' }, { name: 'Ladrillo', hex: '#A63D2A' }, { name: 'Marrón nude', hex: '#A8705A' }, { name: 'Rojo teja', hex: '#B5483A' }],
    blush: [{ name: 'Durazno intenso', hex: '#E08E6D' }, { name: 'Terracota suave', hex: '#D08060' }],
    eyes:  [{ name: 'Bronce', hex: '#A5753E' }, { name: 'Verde oliva', hex: '#7A7A2E' }, { name: 'Chocolate', hex: '#5A3825' }, { name: 'Cobre', hex: '#B87333' }],
    tip: 'Tonos tierra y acabado satinado, con base de subtono cálido.',
  },
  invierno: {
    lips:  [{ name: 'Rojo cereza', hex: '#C4122F' }, { name: 'Fucsia', hex: '#D81B78' }, { name: 'Ciruela', hex: '#6B1E4F' }, { name: 'Rosa intenso', hex: '#E75480' }],
    blush: [{ name: 'Rosa frío intenso', hex: '#D96A8C' }, { name: 'Vino suave', hex: '#A8506A' }],
    eyes:  [{ name: 'Gris carbón', hex: '#3A3F47' }, { name: 'Azul rey', hex: '#1F4FBF' }, { name: 'Púrpura', hex: '#5B2A86' }, { name: 'Plata', hex: '#C0C0C0' }],
    tip: 'Alto contraste: labios definidos y colores intensos, con base de subtono frío.',
  },
};

// ---- Accesorios (metales) por estación ----
export const ACCESSORIES = {
  primavera: {
    primary: 'Dorado',
    metals: [{ name: 'Oro amarillo', hex: '#D4AF37' }, { name: 'Oro rosa', hex: '#E0A899' }],
    reason: 'Con subtono cálido, los metales dorados armonizan con tu piel.',
  },
  verano: {
    primary: 'Plateado',
    metals: [{ name: 'Plata', hex: '#C0C0C0' }, { name: 'Oro blanco', hex: '#E8E8E3' }, { name: 'Oro rosa', hex: '#E0A899' }],
    reason: 'Con subtono frío, los metales plateados armonizan con tu piel.',
  },
  otono: {
    primary: 'Dorado',
    metals: [{ name: 'Oro envejecido', hex: '#B8963E' }, { name: 'Bronce', hex: '#A5753E' }, { name: 'Cobre', hex: '#B87333' }],
    reason: 'Con subtono cálido, los metales dorados y cobrizos armonizan con tu piel.',
  },
  invierno: {
    primary: 'Plateado',
    metals: [{ name: 'Plata brillante', hex: '#C0C0C0' }, { name: 'Platino', hex: '#E5E4E2' }, { name: 'Oro blanco', hex: '#E8E8E3' }],
    reason: 'Con subtono frío, los metales plateados y brillantes armonizan con tu piel.',
  },
};

// ---- Escotes y cuellos por forma facial ----
export const NECKLINE_TYPES = {
  v: 'Cuello en V',
  u: 'Escote en U',
  redondo: 'Cuello redondo',
  cuadrado: 'Cuello cuadrado',
  alto: 'Cuello alto',
  barco: 'Escote barco / hombros abiertos',
};

export const NECKLINES = {
  ovalado: {
    best: ['v', 'redondo', 'cuadrado', 'barco'],
    avoid: [],
    why: 'Tus proporciones son equilibradas, así que casi cualquier escote te funciona. Elige según la ocasión.',
  },
  redondo: {
    best: ['v', 'u'],
    avoid: ['redondo', 'alto'],
    why: 'Las líneas abiertas y verticales alargan visualmente el rostro; los cuellos cerrados y redondos lo acortan.',
  },
  cuadrado: {
    best: ['redondo', 'u', 'v'],
    avoid: ['cuadrado', 'barco'],
    why: 'Las líneas curvas suavizan una mandíbula marcada; los cuellos rectos repiten sus ángulos.',
  },
  alargado: {
    best: ['redondo', 'barco', 'cuadrado'],
    avoid: ['v', 'alto'],
    why: 'Las líneas horizontales y los escotes poco profundos acortan visualmente un rostro alargado.',
  },
  corazon: {
    best: ['v', 'u', 'redondo'],
    avoid: ['barco'],
    why: 'Los escotes que se abren hacia abajo equilibran una frente más ancha que la mandíbula; los hombros muy abiertos acentúan la parte alta.',
  },
  diamante: {
    best: ['cuadrado', 'barco', 'redondo'],
    avoid: [],
    why: 'Los escotes horizontales dan amplitud a la frente y a la mandíbula, que son más angostas que los pómulos.',
  },
};
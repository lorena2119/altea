import { FACE_SHAPE_RULES, POSE_LIMITS } from '../data/thresholds.js';

// Índices de la malla de 478 puntos de MediaPipe Face Landmarker.
// Los puntos del contorno pertenecen al óvalo facial oficial (FaceLandmarker.FACE_LANDMARKS_FACE_OVAL).
export const LM = {
  FOREHEAD_TOP: 10,     // parte alta de la frente (tope de la malla, no el nacimiento del pelo)
  CHIN: 152,            // punta del mentón
  CHEEK_LEFT: 234,      // borde del rostro a la altura de los pómulos (izquierda de la imagen)
  CHEEK_RIGHT: 454,     // borde del rostro a la altura de los pómulos (derecha de la imagen)
  FOREHEAD_LEFT: 54,    // sien / borde superior de la frente
  FOREHEAD_RIGHT: 284,
  JAW_LEFT: 58,         // ángulo de la mandíbula
  JAW_RIGHT: 288,
  EYE_OUTER_LEFT: 33,   // esquina externa de cada ojo
  EYE_OUTER_RIGHT: 263,
  NOSE_TIP: 1,
};

// Cada medida es la distancia entre dos landmarks. También se usa para dibujarlas.
export const MEASURES = {
  length:        { from: LM.FOREHEAD_TOP,   to: LM.CHIN,           label: 'Largo' },
  cheekWidth:    { from: LM.CHEEK_LEFT,     to: LM.CHEEK_RIGHT,    label: 'Pómulos' },
  foreheadWidth: { from: LM.FOREHEAD_LEFT,  to: LM.FOREHEAD_RIGHT, label: 'Frente' },
  jawWidth:      { from: LM.JAW_LEFT,       to: LM.JAW_RIGHT,      label: 'Mandíbula' },
};

// PASO 1. Los landmarks vienen normalizados (0-1). Hay que pasarlos a píxeles
// para no deformar las proporciones en fotos que no son cuadradas.
export function toPixelPoints(landmarks, width, height) {
  return landmarks.map((p) => ({ x: p.x * width, y: p.y * height }));
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// PASO 2. Distancias en píxeles. Al ser distancias, no cambian si la cabeza está algo inclinada.
export function measureFace(pts) {
  const out = {};
  for (const [key, m] of Object.entries(MEASURES)) out[key] = dist(pts[m.from], pts[m.to]);
  return out;
}

// PASO 3. Proporciones: no dependen del tamaño de la foto.
// Todo se compara con el ancho de pómulos, que se toma como el ancho de referencia.
export function computeRatios(m) {
  return {
    lengthToWidth: m.length / m.cheekWidth,
    foreheadToCheek: m.foreheadWidth / m.cheekWidth,
    jawToCheek: m.jawWidth / m.cheekWidth,
    jawToForehead: m.jawWidth / m.foreheadWidth,
  };
}

// PASO 4. Clasificación por reglas, en orden. La primera que se cumple gana.
// Es una aproximación con landmarks 2D: los umbrales están en data/thresholds.js.
export function classifyFaceShape(r) {
  const T = FACE_SHAPE_RULES;
  const f = (n) => n.toFixed(2);
  const strongJaw = r.jawToCheek >= T.SQUARE_MIN_JAW;

  if (r.lengthToWidth >= T.ELONGATED_MIN) {
    return { shape: 'alargado', reason: `El rostro es mucho más largo que ancho (largo/ancho = ${f(r.lengthToWidth)}).` };
  }
  if (r.foreheadToCheek <= T.DIAMOND_MAX_FOREHEAD && r.jawToCheek <= T.DIAMOND_MAX_JAW) {
    return { shape: 'diamante', reason: `Los pómulos son lo más ancho: la frente (${f(r.foreheadToCheek)}) y la mandíbula (${f(r.jawToCheek)}) son más angostas.` };
  }
  if (r.jawToForehead <= T.HEART_MAX_JAW_TO_FOREHEAD) {
    return { shape: 'corazon', reason: `La mandíbula es bastante más angosta que la frente (${f(r.jawToForehead)}).` };
  }
  if (r.lengthToWidth <= T.ROUND_MAX_LENGTH) {
    return strongJaw
      ? { shape: 'cuadrado', reason: `Largo y ancho son parecidos (${f(r.lengthToWidth)}) y la mandíbula es marcada (${f(r.jawToCheek)}).` }
      : { shape: 'redondo', reason: `Largo y ancho son parecidos (${f(r.lengthToWidth)}) y la mandíbula es suave (${f(r.jawToCheek)}).` };
  }
  if (strongJaw && r.lengthToWidth <= T.SQUARE_MAX_LENGTH) {
    return { shape: 'cuadrado', reason: `Mandíbula marcada (${f(r.jawToCheek)}) y proporciones poco alargadas (${f(r.lengthToWidth)}).` };
  }
  return { shape: 'ovalado', reason: `Proporciones equilibradas: algo más largo que ancho (${f(r.lengthToWidth)}), sin frente ni mandíbula extremas.` };
}

// PASO 5. ¿Está el rostro de frente? Se estima con dos señales sencillas.
// - Simetría: dónde cae la nariz entre los dos bordes del rostro (1 = centrada).
// - Inclinación: ángulo de la línea que une las esquinas externas de los ojos.
// No detecta si la cabeza está levantada o agachada.
export function estimatePose(pts) {
  const left = pts[LM.CHEEK_LEFT];
  const right = pts[LM.CHEEK_RIGHT];
  const nose = pts[LM.NOSE_TIP];

  const len = dist(left, right);
  const ux = (right.x - left.x) / len;
  const uy = (right.y - left.y) / len;
  const a = (nose.x - left.x) * ux + (nose.y - left.y) * uy; // nariz → borde izquierdo
  const b = len - a;                                          // nariz → borde derecho
  const symmetry = Math.max(0, Math.min(a, b)) / Math.max(a, b);

  const eyeL = pts[LM.EYE_OUTER_LEFT];
  const eyeR = pts[LM.EYE_OUTER_RIGHT];
  const rollDeg = (Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x) * 180) / Math.PI;

  const problems = [];
  if (symmetry < POSE_LIMITS.MIN_SYMMETRY) {
    problems.push('La cabeza parece girada hacia un lado; mira de frente a la cámara.');
  }
  if (Math.abs(rollDeg) > POSE_LIMITS.MAX_ROLL_DEG) {
    problems.push('La cabeza parece inclinada; mantenla recta.');
  }
  return { symmetry, rollDeg, problems };
}

// Función que reúne todo el análisis
export function analyzeFace(landmarks, width, height) {
  const pts = toPixelPoints(landmarks, width, height);
  const measures = measureFace(pts);
  const ratios = computeRatios(measures);
  const { shape, reason } = classifyFaceShape(ratios);
  const pose = estimatePose(pts);
  return { measures, ratios, shape, reason, pose };
}
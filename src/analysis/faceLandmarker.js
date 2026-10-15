import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FACE_LIMITS } from '../data/thresholds.js';

// Los archivos wasm se descargan de la CDN, con la misma versión del paquete
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL = '/models/face_landmarker.task';

let landmarkerPromise = null;

// El modelo se carga una sola vez y se reutiliza
export function loadFaceLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'IMAGE',
        numFaces: 2, // se piden 2 para poder avisar si hay más de una persona
      });
    })().catch((err) => {
      landmarkerPromise = null; // permite reintentar
      throw err;
    });
  }
  return landmarkerPromise;
}

// Revisa el encuadre usando la caja que ocupan los landmarks (coordenadas 0-1)
function checkFraming(landmarks) {
  const xs = landmarks.map((p) => p.x);
  const ys = landmarks.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const problems = [];
  if (minX < 0 || maxX > 1 || minY < 0 || maxY > 1) {
    problems.push('Parte del rostro queda fuera de la foto; deja la cabeza completa dentro del encuadre.');
  }
  if (maxX - minX < FACE_LIMITS.MIN_FACE_WIDTH_RATIO) {
    problems.push('El rostro se ve pequeño; acércate o recorta la foto.');
  }
  return problems;
}

// Devuelve { status: 'ok' | 'no-face' | 'multiple', landmarks, problems }
export async function detectFace(image) {
  const landmarker = await loadFaceLandmarker();
  const result = landmarker.detect(image);
  const faces = result.faceLandmarks;

  if (faces.length === 0) return { status: 'no-face', landmarks: null, problems: [] };
  if (faces.length > 1) return { status: 'multiple', landmarks: null, problems: [] };
  return { status: 'ok', landmarks: faces[0], problems: checkFraming(faces[0]) };
}
import { validateImageFile } from '../analysis/imageValidation.js';
import { detectFace } from '../analysis/faceLandmarker.js';
import { analyzeFace, MEASURES } from '../analysis/faceGeometry.js';
import { sampleSkinColor } from '../analysis/skinColor.js';
import { classifyColorimetry } from '../analysis/colorimetry.js';
import { buildRecommendations } from '../recommender/recommender.js';
import { renderResults, clearResults } from './resultsPanel.js';
import { setStep } from './stepper.js';

let current = null; // { image, url, landmarks, geometry, skin, color, reco }

// Estas funciones permiten leer los resultados desde otros módulos
export const getCurrentImage = () => (current ? current.image : null);
export const getCurrentLandmarks = () => (current ? current.landmarks : null);
export const getCurrentGeometry = () => (current ? current.geometry : null);
export const getCurrentColor = () => (current ? current.color : null);
export const getCurrentRecommendations = () => (current ? current.reco : null);

export function initUploader() {
  const input = document.getElementById('photo-input');
  const preview = document.getElementById('preview');
  const message = document.getElementById('upload-message');
  const toggle = document.getElementById('show-landmarks');
  const grid = document.querySelector('.analysis-grid');
  const resultsPanel = document.getElementById('results-panel');
  let runId = 0; // evita que un análisis viejo pise a uno nuevo

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message message--${type}`;
    message.hidden = false;
  }

  function renderPreview() {
    if (!current) return;
    let canvas = preview.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Vista previa de tu foto');
      preview.prepend(canvas);
    }
    const { image, landmarks, geometry, skin } = current;
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    if (landmarks && toggle.checked) {
      // Landmarks
      const r = Math.max(1.5, w / 450);
      ctx.fillStyle = '#6A55C9';
      for (const p of landmarks) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Medidas: largo, pómulos, frente y mandíbula
      if (geometry) {
        ctx.strokeStyle = '#E0527F';
        ctx.lineWidth = Math.max(2, w / 300);
        for (const m of Object.values(MEASURES)) {
          ctx.beginPath();
          ctx.moveTo(landmarks[m.from].x * w, landmarks[m.from].y * h);
          ctx.lineTo(landmarks[m.to].x * w, landmarks[m.to].y * h);
          ctx.stroke();
        }
      }
      // Zonas de piel: verde = usada, gris punteado = descartada
      if (skin) {
        ctx.lineWidth = Math.max(2, w / 300);
        for (const p of skin.patches) {
          ctx.strokeStyle = p.used ? '#2E9E6B' : '#8A8A8A';
          ctx.setLineDash(p.used ? [] : [6, 6]);
          ctx.beginPath();
          ctx.arc(p.cx, p.cy, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
    }
    preview.classList.add('has-image');
  }

  // Vuelve al inicio del proceso mostrando un mensaje
  function fail(text) {
    setStep(1);
    showMessage(text, 'error');
  }

  toggle.addEventListener('change', renderPreview);

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const myRun = ++runId;

    // PASO 1 · FOTO
    setStep(1);
    showMessage('Analizando imagen...', 'info');
    const result = await validateImageFile(file);
    input.value = ''; // permite volver a elegir el mismo archivo
    if (myRun !== runId) return;

    if (!result.ok) {
      showMessage(result.error, 'error'); // se conserva la foto anterior, si había
      return;
    }

    if (current) URL.revokeObjectURL(current.url);
    current = { image: result.image, url: result.url, landmarks: null, geometry: null, skin: null, color: null, reco: null };
    toggle.disabled = true;
    clearResults();
    grid.classList.remove('has-results');
    renderPreview();

    // PASO 2 · ANÁLISIS FACIAL
    setStep(2);
    showMessage('Detectando rostro...', 'info');
    let detection;
    try {
      detection = await detectFace(result.image);
    } catch (err) {
      console.error(err);
      if (myRun === runId) fail('No pudimos cargar el detector de rostros. Revisa tu conexión e inténtalo de nuevo.');
      return;
    }
    if (myRun !== runId) return;

    if (detection.status === 'no-face') {
      fail('No detectamos un rostro. Usa una foto frontal, con buena iluminación y sin cubrir la cara.');
      return;
    }
    if (detection.status === 'multiple') {
      fail('Detectamos más de un rostro. Sube una foto en la que aparezca solo una persona.');
      return;
    }

    showMessage('Analizando características...', 'info');
    current.landmarks = detection.landmarks;
    current.geometry = analyzeFace(detection.landmarks, result.image.naturalWidth, result.image.naturalHeight);

    // PASO 3 · COLORIMETRÍA
    setStep(3);
    showMessage('Midiendo el color de tu piel...', 'info');
    const notes = [...result.warnings, ...detection.problems, ...current.geometry.pose.problems];
    try {
      const skin = sampleSkinColor(result.image, detection.landmarks);
      current.skin = skin;
      if (skin.ok) {
        current.color = classifyColorimetry(skin.lab);
        current.reco = buildRecommendations(current.color, current.geometry);
        notes.push(...skin.warnings);
      } else {
        notes.push(skin.error);
      }
    } catch (err) {
      console.error(err);
      notes.push('No pudimos medir el color de tu piel.');
    }
    toggle.disabled = false;
    renderPreview();

    // PASO 4 · RESULTADOS
    if (!current.reco) {
      setStep(2); // sin color no hay recomendaciones
      showMessage(notes.join(' '), 'warning');
      return;
    }
    setStep(4);
    renderResults({ geometry: current.geometry, skin: current.skin, color: current.color, reco: current.reco });
    grid.classList.add('has-results');
    if (window.matchMedia('(max-width: 899px)').matches) {
      resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (notes.length) showMessage(notes.join(' '), 'warning');
    else showMessage('Análisis completado. Resultado aproximado.', 'success');
  });
}
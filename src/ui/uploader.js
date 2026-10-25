import { validateImageFile } from '../analysis/imageValidation.js';
import { detectFace } from '../analysis/faceLandmarker.js';
import { analyzeFace, MEASURES } from '../analysis/faceGeometry.js';
import { sampleSkinColor } from '../analysis/skinColor.js';
import { classifyColorimetry } from '../analysis/colorimetry.js';
import { renderGeometryPanel, clearGeometryPanel } from './geometryPanel.js';
import { renderColorPanel, clearColorPanel } from './colorPanel.js';

let current = null; // { image, url, landmarks, geometry, skin, color }

// Las siguientes etapas leerán la foto y los resultados con estas funciones
export function getCurrentImage() {
  return current ? current.image : null;
}
export function getCurrentLandmarks() {
  return current ? current.landmarks : null;
}
export function getCurrentGeometry() {
  return current ? current.geometry : null;
}
export function getCurrentColor() {
  return current ? current.color : null;
}

export function initUploader() {
  const input = document.getElementById('photo-input');
  const preview = document.getElementById('preview');
  const message = document.getElementById('upload-message');
  const toggle = document.getElementById('show-landmarks');
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

  toggle.addEventListener('change', renderPreview);

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const myRun = ++runId;

    showMessage('Analizando imagen...', 'info');
    const result = await validateImageFile(file);
    input.value = ''; // permite volver a elegir el mismo archivo
    if (myRun !== runId) return;

    if (!result.ok) {
      showMessage(result.error, 'error'); // se conserva la foto anterior, si había
      return;
    }

    if (current) URL.revokeObjectURL(current.url);
    current = { image: result.image, url: result.url, landmarks: null, geometry: null, skin: null, color: null };
    toggle.disabled = true;
    clearGeometryPanel();
    clearColorPanel();
    renderPreview();

    showMessage('Detectando rostro...', 'info');
    let detection;
    try {
      detection = await detectFace(result.image);
    } catch (err) {
      console.error(err);
      if (myRun === runId) {
        showMessage('No pudimos cargar el detector de rostros. Revisa tu conexión e inténtalo de nuevo.', 'error');
      }
      return;
    }
    if (myRun !== runId) return;

    if (detection.status === 'no-face') {
      showMessage('No detectamos un rostro. Usa una foto frontal, con buena iluminación y sin cubrir la cara.', 'error');
      return;
    }
    if (detection.status === 'multiple') {
      showMessage('Detectamos más de un rostro. Sube una foto en la que aparezca solo una persona.', 'error');
      return;
    }

    showMessage('Analizando características...', 'info');
    current.landmarks = detection.landmarks;
    current.geometry = analyzeFace(
      detection.landmarks,
      result.image.naturalWidth,
      result.image.naturalHeight
    );
    renderGeometryPanel(current.geometry);

    // Colorimetría: mide la piel y clasifica la estación
    const colorNotes = [];
    try {
      const skin = sampleSkinColor(result.image, detection.landmarks);
      current.skin = skin;
      if (skin.ok) {
        current.color = classifyColorimetry(skin.lab);
        renderColorPanel(skin, current.color);
        colorNotes.push(...skin.warnings);
      } else {
        colorNotes.push(skin.error);
      }
    } catch (err) {
      console.error(err);
      colorNotes.push('No pudimos medir el color de tu piel.');
    }
    toggle.disabled = false;
    renderPreview();

    const notes = [
      ...result.warnings,
      ...detection.problems,
      ...current.geometry.pose.problems,
      ...colorNotes,
    ];
    if (notes.length) {
      showMessage(notes.join(' '), 'warning');
    } else {
      showMessage('Rostro analizado. Resultado aproximado.', 'success');
    }
  });
}
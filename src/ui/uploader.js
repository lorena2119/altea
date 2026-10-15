import { validateImageFile } from '../analysis/imageValidation.js';
import { detectFace } from '../analysis/faceLandmarker.js';

let current = null; // { image, url, landmarks }

// Las siguientes etapas leerán la foto y los landmarks con estas funciones
export function getCurrentImage() {
  return current ? current.image : null;
}
export function getCurrentLandmarks() {
  return current ? current.landmarks : null;
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
    const { image, landmarks } = current;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    if (landmarks && toggle.checked) {
      const r = Math.max(1.5, canvas.width / 450);
      ctx.fillStyle = '#6A55C9';
      for (const p of landmarks) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, r, 0, Math.PI * 2);
        ctx.fill();
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
    current = { image: result.image, url: result.url, landmarks: null };
    toggle.disabled = true;
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

    current.landmarks = detection.landmarks;
    toggle.disabled = false;
    renderPreview();

    const notes = [...result.warnings, ...detection.problems];
    if (notes.length) {
      showMessage(notes.join(' '), 'warning');
    } else {
      showMessage(`Rostro detectado: ${detection.landmarks.length} puntos faciales.`, 'success');
    }
  });
}
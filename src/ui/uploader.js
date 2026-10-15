import { validateImageFile } from '../analysis/imageValidation.js';

let current = null; // { image, url } de la última foto válida

// Las siguientes etapas leerán la foto con esta función
export function getCurrentImage() {
  return current ? current.image : null;
}

export function initUploader() {
  const input = document.getElementById('photo-input');
  const preview = document.getElementById('preview');
  const message = document.getElementById('upload-message');

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message message--${type}`;
    message.hidden = false;
  }

  function setPreview(url) {
    preview.querySelector('img')?.remove();
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Vista previa de tu foto';
    preview.prepend(img);
    preview.classList.add('has-image');
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    showMessage('Revisando la imagen...', 'info');
    const result = await validateImageFile(file);

    if (!result.ok) {
      // Si había una foto válida antes, se conserva
      showMessage(result.error, 'error');
    } else {
      if (current) URL.revokeObjectURL(current.url);
      current = { image: result.image, url: result.url };
      setPreview(result.url);

      if (result.warnings.length) {
        showMessage(result.warnings.join(' '), 'warning');
      } else {
        showMessage('Foto cargada. Lista para analizar.', 'success');
      }
    }

    input.value = ''; // permite volver a elegir el mismo archivo
  });
}
import { IMAGE_LIMITS } from '../data/thresholds.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo decodificar'));
    img.src = url;
  });
}

// Brillo medio (0-255) de la imagen reducida a 64x64.
// Es una medida global y aproximada: incluye fondo y cabello.
function averageBrightness(img) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return sum / (size * size);
}

// Devuelve { ok, error, warnings, image, url }
export async function validateImageFile(file) {
  const result = { ok: false, error: null, warnings: [], image: null, url: null };

  if (!file) {
    result.error = 'No se seleccionó ningún archivo.';
    return result;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    result.error = /\.hei[cf]$/i.test(file.name)
      ? 'Las fotos HEIC de iPhone no son compatibles. Conviértela a JPG o PNG e inténtalo de nuevo.'
      : 'Formato no compatible. Usa una imagen JPG, PNG o WEBP.';
    return result;
  }

  if (file.size > IMAGE_LIMITS.MAX_FILE_MB * 1024 * 1024) {
    result.error = `La imagen pesa demasiado. El máximo es ${IMAGE_LIMITS.MAX_FILE_MB} MB.`;
    return result;
  }

  const url = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImage(url);
  } catch {
    URL.revokeObjectURL(url);
    result.error = 'No pudimos abrir la imagen. Prueba con otra foto.';
    return result;
  }

  const { naturalWidth: w, naturalHeight: h } = image;
  if (Math.min(w, h) < IMAGE_LIMITS.MIN_SIDE_PX) {
    URL.revokeObjectURL(url);
    result.error = `La imagen es muy pequeña (${w}×${h} px). Usa una de al menos ${IMAGE_LIMITS.MIN_SIDE_PX} px por lado.`;
    return result;
  }

  const brightness = averageBrightness(image);
  if (brightness < IMAGE_LIMITS.MIN_BRIGHTNESS) {
    result.warnings.push('La foto parece muy oscura; con más luz el análisis será más confiable.');
  } else if (brightness > IMAGE_LIMITS.MAX_BRIGHTNESS) {
    result.warnings.push('La foto parece muy clara o con exceso de luz; evita el flash directo.');
  }

  result.ok = true;
  result.image = image;
  result.url = url;
  return result;
}
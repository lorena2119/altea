// Límites de validación de la foto (Etapa 3)
export const IMAGE_LIMITS = {
  MAX_FILE_MB: 10,
  MIN_SIDE_PX: 480,      // lado menor mínimo de la imagen
  MIN_BRIGHTNESS: 55,    // brillo medio (0-255): por debajo, foto muy oscura
  MAX_BRIGHTNESS: 215,   // por encima, foto muy clara
};

// Límites del rostro detectado (Etapa 4). Se calibrarán en la Etapa 10.
export const FACE_LIMITS = {
  MIN_FACE_WIDTH_RATIO: 0.25, // ancho del rostro / ancho de la imagen
};
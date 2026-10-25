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

// Reglas de forma facial (Etapa 5).
// Valores INICIALES, sin calibrar con fotos reales: se ajustan en la Etapa 10.
export const FACE_SHAPE_RULES = {
  ELONGATED_MIN: 1.30,          // largo/ancho a partir del cual el rostro es alargado
  ROUND_MAX_LENGTH: 1.10,       // largo/ancho máximo para redondo o cuadrado
  SQUARE_MAX_LENGTH: 1.22,      // largo/ancho máximo para cuadrado
  SQUARE_MIN_JAW: 0.88,         // mandíbula/pómulos mínimo para una mandíbula marcada
  DIAMOND_MAX_FOREHEAD: 0.80,   // frente/pómulos máximo para diamante
  DIAMOND_MAX_JAW: 0.80,        // mandíbula/pómulos máximo para diamante
  HEART_MAX_JAW_TO_FOREHEAD: 0.85, // mandíbula/frente máximo para corazón
};

// Límites para considerar que el rostro está de frente
export const POSE_LIMITS = {
  MIN_SYMMETRY: 0.80, // 1 = nariz centrada entre los bordes del rostro
  MAX_ROLL_DEG: 10,   // inclinación máxima de la línea de los ojos
};

// Muestreo de piel (Etapa 6). Valores iniciales: se ajustan en la Etapa 10.
export const SKIN_SAMPLING = {
  PATCH_RADIUS_RATIO: 0.05,  // radio de cada zona = 5 % del ancho del rostro
  MIN_PIXELS: 50,            // mínimo de píxeles dentro de la foto para usar una zona
  L_TOLERANCE: 12,           // se descartan píxeles con luminosidad muy distinta a la mediana de la zona
  MIN_KEPT_RATIO: 0.5,       // si se descarta más de la mitad, la zona no es confiable
  MAX_PATCH_DELTA_E: 15,     // una zona muy distinta de las demás (pelo, brillo, sombra) se descarta
  MAX_L_SPREAD: 12,          // diferencia máxima de luminosidad entre zonas antes de avisar de luz despareja
};

// Reglas de colorimetría (Etapa 6). Valores iniciales, calibrados solo con 3 fotos.
export const COLOR_RULES = {
  WARM_MIN_HUE_DEG: 50,      // ángulo de tono (en CIELAB) desde el cual el subtono es cálido
  UNDERTONE_MARGIN_DEG: 4,   // margen para avisar "cerca del límite"
  LIGHT_MIN_L: 58,           // luminosidad L* desde la cual la piel se considera clara
  DEPTH_MARGIN_L: 5,
};

// Rango razonable de color de piel en CIELAB. Descarta pelo, fondos grises o ropa.
export const SKIN_RANGE = {
  MIN_L: 20,
  MAX_L: 95,
  MIN_CHROMA: 8,   // intensidad de color mínima (una foto en blanco y negro no sirve)
  MIN_HUE_DEG: 15,
  MAX_HUE_DEG: 85,
};
# ALTEA · Guía de estilo con visión por computador

Prototipo web de un proyecto universitario de *Introducción a la Ingeniería en Inteligencia Artificial*.
El usuario sube una foto de su rostro y ALTEA estima su **forma facial** y su **colorimetría** (estación de color), y con eso genera recomendaciones de **ropa, maquillaje, accesorios y escotes**.

> **Estado:** prototipo educativo. Los resultados son aproximaciones y no reemplazan la asesoría de una profesional.

## Cómo funciona

```
Foto → Validación → MediaPipe → Landmarks → Geometría facial ┐
                                          └→ Color de la piel (CIELAB) → Colorimetría ┴→ Recomendaciones → Resultados
```

1. **Validación:** formato (JPG, PNG, WEBP), peso máximo, resolución mínima y brillo medio.
2. **Detección:** MediaPipe Face Landmarker obtiene 478 puntos del rostro. Se rechazan fotos sin rostro o con varias personas.
3. **Geometría:** con los landmarks se miden largo, pómulos, frente y mandíbula, se calculan proporciones y se clasifica la forma (ovalado, redondo, cuadrado, alargado, corazón o diamante). También se estima si la cabeza está girada o inclinada.
4. **Color:** se muestrean tres zonas de piel (frente y mejillas) ubicadas con landmarks, se descartan píxeles atípicos y zonas que no coinciden entre sí, y el color se pasa a CIELAB.
5. **Colorimetría:** el subtono (ángulo de tono) y la luminosidad (L\*) determinan una de las 4 estaciones.
6. **Recomendaciones:** la estación define colores de ropa, maquillaje y metales; la forma del rostro define los escotes.

### ¿Qué es IA y qué son reglas?

| Parte | Tipo |
|---|---|
| Detección del rostro y de los 478 landmarks | **IA / visión por computador** (modelo de MediaPipe) |
| Medidas, proporciones y clasificación de la forma | Reglas con umbrales explicables |
| Muestreo y conversión del color | Procesamiento de imagen (CIELAB) |
| Clasificación de la estación | Reglas con umbrales explicables |
| Recomendaciones | Tablas de datos editables |

## Tecnologías
- [Vite](https://vite.dev) + JavaScript (sin frameworks de interfaz)
- [`@mediapipe/tasks-vision`](https://www.npmjs.com/package/@mediapipe/tasks-vision) 1.0.1 (Face Landmarker)
- HTML y CSS propios; fuente Plus Jakarta Sans (Google Fonts)

No hay backend, base de datos, cuentas ni APIs de IA generativa.

## Instalación y uso

Requisitos: una versión LTS actual de [Node.js](https://nodejs.org) (mantenla actualizada por los parches de seguridad).

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Descarga el modelo oficial de MediaPipe y guárdalo como `public/models/face_landmarker.task`:
   <https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task>
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre la dirección que aparece (normalmente `http://localhost:5173`).

Para generar la versión de producción:
```bash
npm run build      # genera la carpeta dist/
npm run preview    # la prueba localmente
```

> La primera detección tarda unos segundos porque carga el modelo. Los archivos wasm de MediaPipe se descargan de la CDN jsDelivr, así que la primera vez se necesita conexión a internet.

## Estructura

```
altea/
├── index.html
├── public/
│   ├── models/face_landmarker.task   ← modelo de MediaPipe (descargar)
│   └── modelo.png                    ← imagen de la portada
└── src/
    ├── main.js
    ├── styles/main.css
    ├── analysis/
    │   ├── imageValidation.js        ← validación de la foto
    │   ├── faceLandmarker.js         ← MediaPipe
    │   ├── faceGeometry.js           ← medidas y forma del rostro
    │   ├── skinColor.js              ← muestreo de piel y CIELAB
    │   └── colorimetry.js            ← clasificación de la estación
    ├── recommender/recommender.js    ← une estación + forma del rostro
    ├── data/
    │   ├── thresholds.js             ← TODOS los umbrales
    │   ├── palettes.js               ← paletas por estación
    │   ├── recommendations.js        ← maquillaje, metales y escotes
    │   └── stores.js                 ← sitios web sugeridos
    └── ui/
        ├── uploader.js               ← flujo principal
        ├── stepper.js                ← indicador de pasos
        ├── resultsPanel.js           ← resultados con pestañas
        └── icons.js                  ← iconos
```

## Personalización
- **Umbrales** de forma facial, pose, muestreo de piel y colorimetría: `src/data/thresholds.js`. Son valores iniciales, ajustados con pocas fotos.
- **Paletas, maquillaje, metales y escotes:** `src/data/palettes.js` y `src/data/recommendations.js`.
- **Tiendas sugeridas:** `src/data/stores.js` (verifica que los enlaces abran antes de publicar).

## Limitaciones
- Los landmarks son 2D: la forma del rostro es una **aproximación** que cambia con el ángulo, la expresión y el peinado.
- La iluminación y el balance de blancos de la foto pueden modificar el subtono.
- Solo se mide la piel; una asesoría profesional también considera cabello y ojos.
- El sistema no puede comprobar que la foto sea de una persona real (no hay detección de vida).
- Las recomendaciones de estilo son convenciones habituales, no reglas científicas.
- No se consultan precios ni existencias en las tiendas sugeridas.

## Privacidad
La foto se procesa **en el navegador** y no se envía a ningún servidor. La página solo descarga el modelo, los archivos wasm y la fuente.

## Créditos y licencias
- MediaPipe: Google, licencia Apache 2.0.
- La imagen de portada (`public/modelo.png`) proviene de otra marca y se usa solo para el prototipo académico. **Reemplázala por una imagen propia o con licencia antes de publicar la página.**
- Diseño de referencia: ALTEA (interfaz propuesta para el proyecto).

## Autoría
[Nombres del equipo] · [Universidad] · [Curso y semestre]
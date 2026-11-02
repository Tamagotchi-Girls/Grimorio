# Grimorio · guía de estudio tamagotchi

Guía de estudio web estilo tamagotchi pixel-art para preparar exámenes departamentales de dos
materias: Programación Estructurada (PE) y Fundamentos de Programación (FP). Marca: tamagotchigirls 2026.

## Entorno local

- Se trabaja en WSL con el proyecto en el disco de Windows (/mnt/c/...). Node y pnpm vía mise (`.mise.toml`).
- Levantar: `pnpm install` y luego `pnpm dev:wsl` (activa sondeo de archivos para que la recarga funcione en /mnt/c).
  Se abre en http://localhost:8443. El servidor NO está corriendo por defecto: hay que iniciarlo.
- Revisar antes de publicar: `pnpm build` y `pnpm preview`.
- git se usa desde Git Bash (no desde WSL). Deploy: Vercel (Vite, salida `dist`).

## Estructura

- `src/AppRoot.jsx` — flujo general: bienvenida → elegir hada → elegir materia → app. Llama a `usarMateria(materia)`.
- `src/data/contenido.js` — contenido de la materia activa. Las vistas importan `TEMAS` y `PREGUNTAS` desde aquí.
- `src/data/temas.js`, `src/data/preguntas.js` — contenido de PE (10 temas, 60 reactivos).
- `src/data/fp/temas.js`, `src/data/fp/preguntas.js` — contenido de FP (10 temas, 60 reactivos, ids `fp-…`).
- `src/views/` — pantallas (Inicio, Temas, Tema, Simulacro, Progreso, ElegirHada, Bienvenida, Materias, Importar).
- `src/components/Hada.jsx` — 6 hadas (riley, lyra, vega, aura, nova, onyx) y sus secuencias de animación.
- `src/components/Escena.jsx` — paisaje animado + hada; calcula su escala según el espacio disponible.
- `src/lib/progreso.js` — progreso por materia en localStorage. `src/components/Transferencia.jsx` — QR para llevar el progreso.
- `src/lib/sprites.js` — íconos pixel dibujados como matrices de texto.
- `src/index.css` — estilos; el bloque final "LAYOUT RESPONSIVE v2" define el layout de laptop/tablet/celular.
- `public/sprites/hadas/` y `public/sprites/paisajes/` — PNG de hadas (320x150 por fotograma) y paisajes (tiras de 4 fotogramas, 960x540 c/u).

## Reglas

- Sin backend: perfil y progreso viven en localStorage; se transfieren por QR/enlace (`#/importar?d=…`).
- No mencionar la escuela ni claves de materias de FP en la interfaz.
- Formato de reactivo: `{ id, tema, tipo: "concepto"|"imprime"|"error"|"completa", pregunta, codigo?, opciones[4], correcta, explicacion }`.
  En los de tipo "imprime", la opción correcta debe ser exactamente la salida del programa (compilar con gcc para verificar).
- Pixel art: `image-rendering: pixelated`, escalas en múltiplos de 1/8. Accesibilidad WCAG 2.2 AA (contraste, foco visible, teclado, aria-live).
- Estilos globales dentro de `@layer base` cuando apliquen a elementos; Tailwind v4 está disponible pero el proyecto usa CSS propio.

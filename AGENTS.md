# Grimorio · guía de estudio tamagotchi

Guía de estudio web estilo tamagotchi pixel-art para preparar exámenes departamentales de dos
materias: Programación Estructurada (PE) y Fundamentos de Programación (FP). Marca: tamagotchigirls 2026.

## Entorno local

- Se trabaja en WSL con el proyecto en el disco de Windows (/mnt/c/...). Node y pnpm vía mise (`.mise.toml`).
  Los comandos de Node se corren con `mise exec -- pnpm …` desde WSL.
- Levantar: `pnpm install` y luego `pnpm dev:wsl` (activa sondeo de archivos para que la recarga funcione en /mnt/c).
  Se abre en http://localhost:8443. El servidor NO está corriendo por defecto: hay que iniciarlo.
- Revisar antes de publicar: `pnpm build` y `pnpm preview`.
- git se usa desde Git Bash (no desde WSL). Deploy: Vercel (Vite, salida `dist`). Las imágenes van como archivos
  normales en git (nada de Git LFS: Vercel no lo descarga).

## Scripts de pnpm

- `dev`, `dev:wsl`, `build`, `preview` — servidor de desarrollo (con y sin sondeo), build a `dist/` y vista previa.
- `test` — Vitest (happy-dom): datos, lib, hooks y componentes. `verificar` — solo `src/data/imprime.gcc.test.js`,
  que compila con gcc los reactivos "imprime" y comprueba que la opción correcta es la salida real.
- `e2e` — `tests/e2e/e2e.mjs` (Playwright contra la build): flujo completo, materias, scroll, diálogos, importar, errores.
- `capturas` — `scripts/capturas.mjs`: capturas de las pantallas para comparar refactors de CSS (carpeta `capturas/`, no se versiona).
  `pnpm capturas <nombre> --base <carpeta>` compara con pixelmatch; `--movimiento` (sin reduced-motion), `--bordes`
  (anchos y altos a ambos lados de cada corte de `@media`), `--estilos` (estilos computados de cada elemento),
  `--build`, `--solo <texto>`. Referencias: `capturas/base`, `capturas/mov-base`, `capturas/bordes-base`.
  La captura tiene un poco de ruido propio (ver `docs/PENDIENTES.md`); no se sube la tolerancia.
- `format` — oxfmt. `tunel` — cloudflared hacia el puerto 8443 para probar en el celular.

## Estructura

- `config/site.json` — título, descripción, idioma, ícono y robots del HTML; los aplica el plugin pequeño de `vite.config.ts`.
- `src/AppRoot.jsx` — flujo general: bienvenida → elegir hada → elegir materia → app. Usa `useRuta`, `useModoColor`,
  `useAvisoNivel`; el contenido de la materia activa llega por `ContenidoProvider`.
- `src/data/` — contenido. `ContenidoContext.jsx` (`useContenido()` entrega `TEMAS` y `PREGUNTAS` de la materia activa),
  `materias.js`, `contenido.js`; PE en `temas.js` y `preguntas.js` (10 temas, 60 reactivos); FP en `fp/temas.js` y
  `fp/preguntas.js` (10 temas, 60 reactivos, ids `fp-…`).
- `src/views/` — pantallas (Inicio, Temas, Tema, Simulacro, Progreso, ElegirHada, Bienvenida, Materias, Importar).
  Las grandes se parten en subcarpetas: `tema/`, `simulacro/`, `progreso/`.
- `src/components/` — piezas reutilizables (Aparato, BarraEstado, Navegacion, Escena, Hada, Reactivo, Confirmar, Transferencia…).
  `Hada.jsx`: 6 hadas (riley, lyra, vega, aura, nova, onyx) y sus secuencias de animación. `Escena.jsx`: paisaje animado
  + hada; calcula su escala según el espacio disponible.
- `src/lib/` — lógica sin JSX y hooks:
  - hooks: `useProgreso` (en `progreso.js`), `useRuta` (`ruta.js`), `useModoColor` (`modoColor.js`), `useAvisoNivel`,
    `useMovimientoReducido`, `useSimulacro`, `usePractica`, `useTeclasRespuesta`.
  - datos y reglas: `progreso.js` (progreso por materia en localStorage), `almacenamiento.js` (acceso seguro a
    localStorage y sus `CLAVES`), `validacion.js`, `simulacro.js`, `medallas.js`, `nivel.js`, `conteos.js`.
  - transferencia: `transferencia.js` (`crearEnlace` / `decodificarEnlace`, enlace `#/importar?d=…`).
  - `dimensiones.js` y `constantes.js` — números compartidos con el CSS (los comprueba un test); `sprites.js` — íconos pixel
    como matrices de texto.
  - Cada módulo tiene su `*.test.js` al lado.
- `src/styles/` — CSS propio. `src/index.css` solo los importa, en este orden (cada archivo es un trozo contiguo del CSS
  original, así que la cascada no cambió): `tokens` (variables y colores fijos, tabla de cortes de pantalla) → `aparato` →
  `componentes` → `vistas` → `estados` → `escena-oficial` → `layout-responsive` (layout de laptop/tablet/celular) → `aviso`.
- `public/sprites/hadas/` y `public/sprites/paisajes/` — PNG de hadas (320x150 por fotograma) y paisajes (tiras de 4 fotogramas, 960x540 c/u).
- `docs/PENDIENTES.md` — pendientes por fase y sección "Hecho".

## Reglas

- Sin backend: perfil y progreso viven en localStorage; se transfieren por QR/enlace (`#/importar?d=…`).
  No cambiar las claves de localStorage (ya hay datos guardados con ellas).
- Nombres: el modo claro/oscuro se llama `modoColor` (no "tema", que son los temas del curso).
- No mencionar la escuela ni claves de materias de FP en la interfaz.
- Formato de reactivo: `{ id, tema, tipo: "concepto"|"imprime"|"error"|"completa", pregunta, codigo?, opciones[4], correcta, explicacion }`.
  En los de tipo "imprime", la opción correcta debe ser exactamente la salida del programa (compilar con gcc para verificar).
- Pixel art: `image-rendering: pixelated`, escalas en múltiplos de 1/8. Accesibilidad WCAG 2.2 AA (contraste, foco visible, teclado, aria-live).
- CSS: valores de color fijos como variables (`tokens.css`); los `@media` usan solo los cortes de la tabla de `tokens.css`
  (lo comprueba `src/lib/cortes.test.js`); nada de `!important` nuevo. Tailwind v4 está disponible pero el proyecto usa CSS propio.
- Imports en este orden: paquetes, luego `../` (de más lejos a más cerca), luego `./`. `src/main.tsx` es la excepción
  (fuentes antes que el CSS).

# Grimorio

Guía de estudio tamagotchi para departamentales de Programación Estructurada y Fundamentos de Programación.

## Correr en local (WSL)

```bash
mise trust && mise install
pnpm install
pnpm dev:wsl        # http://localhost:8443
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` / `pnpm dev:wsl` | servidor de desarrollo (`dev:wsl` activa el sondeo de archivos para /mnt/c) |
| `pnpm build` / `pnpm preview` | build a `dist/` y vista previa |
| `pnpm test` | pruebas unitarias (Vitest) |
| `pnpm verificar` | compila con gcc los reactivos "imprime" y comprueba la salida correcta |
| `pnpm e2e` | pruebas de extremo a extremo con Playwright |
| `pnpm capturas <nombre> [--base <carpeta>]` | capturas para comparar cambios de CSS (`--movimiento`, `--bordes`, `--estilos`) |
| `pnpm tunel` | túnel de cloudflared para probar en el celular |
| `pnpm format` | formatea con oxfmt |

## Estructura

```
config/site.json    título, descripción, idioma y robots del HTML
src/AppRoot.jsx     flujo: bienvenida → hada → materia → app
src/data/           temas y reactivos de PE y FP (fp/), contenido de la materia activa
src/views/          pantallas (con subcarpetas tema/, simulacro/, progreso/)
src/components/     piezas reutilizables
src/lib/            lógica y hooks (progreso, ruta, modoColor, simulacro, transferencia…), cada uno con su test
src/styles/         CSS: tokens, aparato, componentes, vistas, estados, escena-oficial, layout-responsive, aviso
public/sprites/     PNG de hadas y paisajes
tests/e2e/          pruebas e2e
scripts/            capturas.mjs
docs/               PENDIENTES.md
```

## Publicar

```bash
pnpm build          # genera dist/
```
En Vercel: Add New → Project → elegir el repo (detecta Vite). Las imágenes van como archivos normales en git (sin Git LFS).

✦ tamagotchigirls 2026

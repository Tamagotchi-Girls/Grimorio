# Pendientes por fase

Cosas que se decidió dejar para una fase posterior. Cada una dice dónde está el problema y cómo
comprobar que quedó resuelto. Al terminar un pendiente, muévelo a la sección "Hecho" del final, con la
fecha y el commit que lo resolvió.

## Después de la fase 6 (accesibilidad)

### Los diálogos de confirmación no atrapan el foco ni cierran con Escape

- **Qué pasa hoy:** `Confirmar` (`src/components/Confirmar.jsx`) tiene `role="alertdialog"` en los de importar y
  simulacro, pero al abrirse no mueve el foco al cuadro, el foco puede salir con Tab y Escape no lo cierra. El de
  "borrar progreso" ni siquiera lleva rol. Se dejó así en la fase 6 porque cambia el comportamiento.
- **Qué hacer:** al abrir, enfocar el botón seguro (Cancelar); atrapar Tab dentro; Escape cancela; al cerrar,
  devolver el foco al botón que lo abrió. Decidir si "borrar progreso" también es `alertdialog`.
- **Cómo comprobarlo:** ampliar las pruebas F de `tests/e2e/e2e.mjs` (F4 hoy fija el orden Cancelar → Confirmar).

## Después de la fase 8

### Cargar el contenido de cada materia con `import()` dinámico (A7)

- **Qué pasa hoy:** `src/data/contenido.js` importa de forma estática los temas y reactivos de PE y FP, así que el
  paquete inicial lleva las dos materias aunque solo se estudie una.
- **Por qué no se hizo en la fase 8:** `ContenidoProvider` entrega el contenido de forma síncrona y `CONTENIDO` lo
  importan `validacion.js`, `resumenMateria` y los selectores de materia. Cargar bajo demanda obliga a un estado de
  "cargando" en el proveedor y a que esas funciones reciban el contenido como parámetro.
- **Qué hacer:** que `ContenidoProvider` cargue la materia con `import()` (con una pantalla de carga mínima) y que
  `validacion.js`/`resumenMateria` dejen de leer `CONTENIDO`.
- **Cómo comprobarlo:** `pnpm build` debe generar un fragmento aparte por materia y las pruebas H del e2e deben seguir pasando.

## Hecho

### `#/importar?d=…` también funciona si se cambia el hash sin recargar

- **Fecha y commit:** 2026-11-02 · resuelto en `3eecfc9` (AppRoot usa `useRuta`); pruebas en `8a1ec88`.
- **Qué era:** `App` calculaba `importar` solo al renderizar y únicamente `Aplicacion` escuchaba `hashchange`, así que
  pegar el enlace en la misma pestaña no abría la importación hasta recargar.
- **Cómo quedó:** la ruta se lee y escucha en un solo lugar (`useRuta`, `src/lib/ruta.js`) y `App` deriva de ahí si
  está en importar. `abrirEnlace` del e2e ya no recarga; la prueba G7 cambia el hash sin recargar.

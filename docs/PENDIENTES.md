# Pendientes por fase

Cosas que se decidió dejar para una fase posterior. Cada una dice dónde está el problema y cómo
comprobar que quedó resuelto. Al terminar un pendiente, bórralo de aquí en el mismo commit que lo arregla.

## Fase 7

### `#/importar?d=…` también debe funcionar si se cambia el hash sin recargar

- **Qué pasa hoy:** `App` (`src/AppRoot.jsx`) calcula `importar = leerRuta() === "importar"` solo al
  renderizar, y únicamente `Aplicacion` escucha `hashchange`. Si la app ya está abierta y se pega el
  enlace en la misma pestaña (cambia el hash, no recarga), no se abre la importación hasta recargar.
  Abrir el enlace en una pestaña nueva sí funciona, que es el uso real.
- **Qué hacer:** que la ruta viva en un solo lugar que escuche `hashchange` también en `App`.
- **Cómo comprobarlo:** una prueba e2e que cambie el hash a `#/importar?d=…` sin recargar y vea la pantalla
  de importación. En `tests/e2e/e2e.mjs`, `abrirEnlace` hace `reload()` justamente por este problema; al
  arreglarlo se puede quitar ese rodeo.

## Después de la fase 6 (accesibilidad)

### Los diálogos de confirmación no atrapan el foco ni cierran con Escape

- **Qué pasa hoy:** `Confirmar` (`src/components/Confirmar.jsx`) tiene `role="alertdialog"` en los de importar y
  simulacro, pero al abrirse no mueve el foco al cuadro, el foco puede salir con Tab y Escape no lo cierra. El de
  "borrar progreso" ni siquiera lleva rol. Se dejó así en la fase 6 porque cambia el comportamiento.
- **Qué hacer:** al abrir, enfocar el botón seguro (Cancelar); atrapar Tab dentro; Escape cancela; al cerrar,
  devolver el foco al botón que lo abrió. Decidir si "borrar progreso" también es `alertdialog`.
- **Cómo comprobarlo:** ampliar las pruebas F de `tests/e2e/e2e.mjs` (F4 hoy fija el orden Cancelar → Confirmar).

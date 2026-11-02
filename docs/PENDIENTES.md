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

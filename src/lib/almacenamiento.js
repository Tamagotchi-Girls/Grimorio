// Única puerta a localStorage: ningún otro módulo toca `localStorage` directamente.
// Todo va en try/catch porque el acceso puede lanzar (modo privado, datos de sitio bloqueados) y
// escribir puede fallar (cuota llena). Un fallo al guardar no se traga: queda registrado en
// `huboFalloAlGuardar()` para que la interfaz lo avise (ver AvisoAlmacenamiento).

// Los VALORES de estas claves no cambian: son los que ya están guardados en los dispositivos.
export const CLAVES = Object.freeze({
  perfil: "grimorio-perfil-v1",
  materiaActiva: "grimorio-materia-activa",
  tema: "guia-pe-tema",
});

export const claveProgreso = (materia) => (materia === "FP" ? "guia-fp-progreso-v1" : "guia-pe-progreso-v1");

let fallo = false;
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());

function registrar(ok) {
  if (fallo === !ok) return; // sin cambio de estado: no se vuelve a avisar
  fallo = !ok;
  avisar();
}

// Para useSyncExternalStore: `true` mientras el último intento de guardar haya fallado.
export const huboFalloAlGuardar = () => fallo;
export function suscribirFallos(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function leerTexto(clave) {
  try { return localStorage.getItem(clave); } catch { return null; }
}

// Devuelve true si se guardó.
export function escribirTexto(clave, valor) {
  try {
    localStorage.setItem(clave, valor);
    registrar(true);
    return true;
  } catch {
    registrar(false);
    return false;
  }
}

export function quitar(clave) {
  try { localStorage.removeItem(clave); } catch { /* sin almacenamiento: no hay nada que quitar */ }
}

// JSON roto o ausente → `porDefecto`.
export function leerJSON(clave, porDefecto = null) {
  const texto = leerTexto(clave);
  if (texto === null) return porDefecto;
  try { return JSON.parse(texto) ?? porDefecto; } catch { return porDefecto; }
}

export function escribirJSON(clave, valor) {
  let texto;
  try { texto = JSON.stringify(valor); } catch { registrar(false); return false; }
  return escribirTexto(clave, texto);
}

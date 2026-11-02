import LZString from "lz-string";
import { leerProgreso } from "./progreso.js";
import { normalizarPerfil, normalizarTransferencia } from "./validacion.js";

// Tamaños máximos de un enlace de importación. Un enlace real con las dos materias llena (y todos
// los simulacros) mide unos 5 100 caracteres comprimido y unos 15 000 de JSON (lo mide y exige
// transferencia.test.js); los límites dejan al menos el doble de holgura sin dejar pasar enlaces absurdos.
// LZString no permite limitar la salida mientras descomprime, así que el tope a la entrada es lo
// que acota cuánto puede crecer un enlace malicioso al descomprimirse.
export const MAX_PARAMETRO = 12_000; // caracteres de `d` antes de descomprimir
export const MAX_JSON = 60_000; // caracteres del resultado después de descomprimir
// percent-encoding triplica como mucho cada carácter: se corta el hash antes de ni siquiera leerlo
const MAX_HASH = MAX_PARAMETRO * 3 + 64;

// Enlace de transferencia: `#/importar?d=<datos comprimidos>`. Sin servidor, todo viaja en el enlace.
export function crearEnlace(perfil) {
  const datos = { version: 1, perfil: normalizarPerfil(perfil) ?? perfil, progreso: { PE: leerProgreso("PE"), FP: leerProgreso("FP") } };
  const codificado = LZString.compressToEncodedURIComponent(JSON.stringify(datos));
  return `${location.origin}${location.pathname}#/importar?d=${encodeURIComponent(codificado)}`;
}

// Devuelve { perfil, progreso: { PE, FP } } ya normalizado, o null si el enlace no sirve
// (ausente, demasiado grande, corrupto o con datos que no se pueden usar).
export function decodificarEnlace(hash = location.hash) {
  try {
    if (hash.length > MAX_HASH) return null;
    const d = new URLSearchParams(hash.split("?")[1] || "").get("d");
    if (!d || d.length > MAX_PARAMETRO) return null;
    const raw = LZString.decompressFromEncodedURIComponent(d);
    if (!raw || raw.length > MAX_JSON) return null;
    return normalizarTransferencia(JSON.parse(raw));
  } catch { return null; }
}

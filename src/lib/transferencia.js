import LZString from "lz-string";
import { leerProgreso } from "./progreso.js";

// Enlace de transferencia: `#/importar?d=<datos comprimidos>`. Sin servidor, todo viaja en el enlace.
export function crearEnlace(perfil) {
  const datos = { version: 1, perfil, progreso: { PE: leerProgreso("PE"), FP: leerProgreso("FP") } };
  const codificado = LZString.compressToEncodedURIComponent(JSON.stringify(datos));
  return `${location.origin}${location.pathname}#/importar?d=${encodeURIComponent(codificado)}`;
}

export function decodificarEnlace() {
  try {
    const consulta = location.hash.split("?")[1] || "";
    const d = new URLSearchParams(consulta).get("d");
    const raw = d ? LZString.decompressFromEncodedURIComponent(d) : null;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

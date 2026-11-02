import { useCallback, useEffect, useState } from "react";
import { irAlInicio } from "./scroll.js";

// "#/tema/3?x=1" → "tema/3"; "" y "#/" → "".
export const rutaDe = (hash) => hash.replace(/^#\/?/, "").split("?")[0] || "";

// La ruta vive en el hash. Un solo lugar lee `location.hash` y escucha `hashchange`; `hash` completo
// se devuelve para quien necesite reaccionar a cambios en los parámetros (p. ej. `#/importar?d=…`).
export function useRuta() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const alCambiar = () => { setHash(location.hash); irAlInicio(); };
    addEventListener("hashchange", alCambiar);
    return () => removeEventListener("hashchange", alCambiar);
  }, []);
  const ir = useCallback((r) => { location.hash = r ? `/${r}` : "/"; }, []);
  return { ruta: rutaDe(hash), hash, ir };
}

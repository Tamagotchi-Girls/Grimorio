import { useEffect, useRef, useState } from "react";

export const DURACION_LEVEL_UP_MS = 1800;

// `true` durante un momento cada vez que `nivel` sube. El valor con el que se monta no cuenta.
export function useAvisoNivel(nivel) {
  const [aviso, setAviso] = useState(false);
  const anterior = useRef(null);
  useEffect(() => {
    if (anterior.current === null) { anterior.current = nivel; return; }
    if (nivel > anterior.current) {
      setAviso(true);
      const id = setTimeout(() => setAviso(false), DURACION_LEVEL_UP_MS);
      anterior.current = nivel;
      return () => clearTimeout(id);
    }
    anterior.current = nivel;
  }, [nivel]);
  return aviso;
}

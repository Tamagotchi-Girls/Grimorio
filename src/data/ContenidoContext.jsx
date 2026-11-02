import { createContext, useContext, useMemo } from "react";
import { contenidoDe } from "./contenido.js";

const ContenidoContext = createContext(null);

// Da a todo lo de adentro el contenido de `materia`. Cambiar `materia` cambia el contenido en el siguiente render.
export function ContenidoProvider({ materia, children }) {
  const valor = useMemo(() => contenidoDe(materia), [materia]);
  return <ContenidoContext.Provider value={valor}>{children}</ContenidoContext.Provider>;
}

// { materia, TEMAS, PREGUNTAS } de la materia activa.
export function useContenido() {
  const valor = useContext(ContenidoContext);
  if (!valor) throw new Error("useContenido debe usarse dentro de <ContenidoProvider>");
  return valor;
}

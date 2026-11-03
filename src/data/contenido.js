// Contenido de cada materia: datos constantes, sin estado. La materia activa se obtiene con
// `useContenido()` (ver ContenidoContext.jsx), no con valores globales que cambien.
import { PREGUNTAS as PREGUNTAS_FP } from "./fp/preguntas.js";
import { TEMAS as TEMAS_FP } from "./fp/temas.js";
import { PREGUNTAS as PREGUNTAS_PE } from "./preguntas.js";
import { TEMAS as TEMAS_PE } from "./temas.js";

export const CONTENIDO = Object.freeze({
  PE: Object.freeze({ TEMAS: TEMAS_PE, PREGUNTAS: PREGUNTAS_PE }),
  FP: Object.freeze({ TEMAS: TEMAS_FP, PREGUNTAS: PREGUNTAS_FP }),
});

// { materia, TEMAS, PREGUNTAS } de una materia; una clave desconocida cae en PE.
export function contenidoDe(materia) {
  const id = Object.hasOwn(CONTENIDO, materia) ? materia : "PE";
  return { materia: id, ...CONTENIDO[id] };
}

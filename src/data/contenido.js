// Contenido de la materia activa. Las vistas importan TEMAS y PREGUNTAS desde aquí;
// AppRoot llama a usarMateria() antes de dibujar, y como los exports de ES modules son
// "vivos", todas las vistas leen el contenido de la materia elegida.
import { TEMAS as TEMAS_PE } from "./temas.js";
import { PREGUNTAS as PREGUNTAS_PE } from "./preguntas.js";
import { TEMAS as TEMAS_FP } from "./fp/temas.js";
import { PREGUNTAS as PREGUNTAS_FP } from "./fp/preguntas.js";

export const CONTENIDO = {
  PE: { TEMAS: TEMAS_PE, PREGUNTAS: PREGUNTAS_PE },
  FP: { TEMAS: TEMAS_FP, PREGUNTAS: PREGUNTAS_FP },
};

export let TEMAS = TEMAS_PE;
export let PREGUNTAS = PREGUNTAS_PE;

export function usarMateria(materia) {
  const c = CONTENIDO[materia] || CONTENIDO.PE;
  TEMAS = c.TEMAS;
  PREGUNTAS = c.PREGUNTAS;
}

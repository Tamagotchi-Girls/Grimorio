import { reactivosPorTemaEnSimulacro } from "./conteos.js";
import { barajar, prepararReactivo } from "./progreso.js";

// Los mismos reactivos de cada tema, para que el examen cubra todos los temas, en orden aleatorio.
export function nuevoSimulacro(temas, preguntas) {
  const porTema = reactivosPorTemaEnSimulacro(temas);
  const elegidos = temas.flatMap((t) => barajar(preguntas.filter((p) => p.tema === t.id)).slice(0, porTema));
  return barajar(elegidos).map(prepararReactivo);
}

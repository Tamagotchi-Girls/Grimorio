import { reactivosPorTemaEnSimulacro } from "./conteos.js";
import { barajar, prepararReactivo } from "./progreso.js";

// Los mismos reactivos de cada tema, para que el examen cubra todos los temas, en orden aleatorio.
export function nuevoSimulacro(temas, preguntas) {
  const porTema = reactivosPorTemaEnSimulacro(temas);
  const elegidos = temas.flatMap((t) => barajar(preguntas.filter((p) => p.tema === t.id)).slice(0, porTema));
  return barajar(elegidos).map(prepararReactivo);
}

// ¿La respuesta elegida (índice en `opcionesBarajadas`) es la correcta? Sin respuesta cuenta como incorrecta.
export const esCorrecta = (reactivo, eleccion) => eleccion !== undefined && reactivo.opcionesBarajadas[eleccion].correcta;

// Calificación de un simulacro. `respuestas` es { [posición]: índice de opción elegida }.
// Devuelve { aciertos, total, calificacion, porTema } (lo que se guarda, sin fecha).
export function calificar(reactivos, respuestas) {
  let aciertos = 0;
  const porTema = {};
  reactivos.forEach((r, k) => {
    const ok = esCorrecta(r, respuestas[k]);
    if (ok) aciertos++;
    porTema[r.tema] = porTema[r.tema] || { ok: 0, total: 0 };
    porTema[r.tema].total++;
    if (ok) porTema[r.tema].ok++;
  });
  return { aciertos, total: reactivos.length, calificacion: Math.round((aciertos / reactivos.length) * 100), porTema };
}

// [id, acierto] de cada reactivo que sí se respondió, para registrarlos todos juntos en el progreso.
export const respuestasARegistrar = (reactivos, respuestas) =>
  reactivos.flatMap((r, k) => (respuestas[k] === undefined ? [] : [[r.id, esCorrecta(r, respuestas[k])]]));

// Temas en los que se falló algo, en el orden de `temas`.
export const temasFlojos = (temas, porTema) => temas.filter((t) => porTema[t.id] && porTema[t.id].ok < porTema[t.id].total);

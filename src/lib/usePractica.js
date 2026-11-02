import { useMemo, useState } from "react";
import { useContenido } from "../data/ContenidoContext.jsx";
import { esCorrecta } from "./simulacro.js";
import { prepararReactivo } from "./progreso.js";
import { medallaDeTema } from "./medallas.js";

// Un solo texto para el final de la práctica de un tema, según la medalla.
export function mensajeResultado(medalla) {
  return medalla === "copa"
    ? "¡Tema dominado! Cada respuesta fue correcta."
    : medalla === "estrella"
    ? "¡Muy bien! Revisa los apuntes de lo que fallaste y vuelve a intentarlo."
    : "Lee otra vez los apuntes con calma. La segunda vuelta siempre sale mejor.";
}

// Estado de cada cuadrito del progreso de la ronda: "ok", "mal", "actual" (el que toca) o "nada".
export function estadosDeRonda(reactivos, respuestas, i) {
  return reactivos.map((r, k) => {
    const s = respuestas[k];
    return s === undefined ? (k === i ? "actual" : "nada") : esCorrecta(r, s) ? "ok" : "mal";
  });
}

// Animación del hada según la última respuesta: sin responder, "reposo"; si no, "acierto" o "fallo".
export const secuenciaDeRespuesta = (reactivo, seleccion) =>
  seleccion === undefined ? "reposo" : esCorrecta(reactivo, seleccion) ? "acierto" : "fallo";

// Práctica de un tema: los reactivos (con las opciones barajadas), cuál toca, lo respondido y las acciones.
// Cada respuesta se registra en el progreso (`prog.registrar`) en cuanto se elige.
export function usePractica(tema, prog) {
  const { PREGUNTAS } = useContenido();
  const [ronda, setRonda] = useState(0);
  // `ronda` no se lee dentro: cambiarla fuerza a barajar de nuevo las opciones al repetir el tema.
  const reactivos = useMemo(
    () => PREGUNTAS.filter((p) => p.tema === tema.id).map(prepararReactivo),
    [tema.id, PREGUNTAS, ronda]
  );
  const [i, setI] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const actual = reactivos[i];
  const seleccion = respuestas[i];
  const respondida = seleccion !== undefined;
  const terminado = i >= reactivos.length;
  const aciertos = reactivos.filter((r, k) => esCorrecta(r, respuestas[k])).length;

  const elegir = (opcion) => {
    if (respondida) return;
    setRespuestas((r) => ({ ...r, [i]: opcion }));
    prog.registrar(actual.id, actual.opcionesBarajadas[opcion].correcta);
  };
  const siguiente = () => setI((v) => v + 1);
  const repetir = () => { setRonda((r) => r + 1); setI(0); setRespuestas({}); };

  return {
    reactivos, ronda, i, respuestas, actual, seleccion, respondida, terminado, aciertos,
    medalla: medallaDeTema(aciertos, reactivos.length),
    ultima: i === reactivos.length - 1,
    elegir, siguiente, repetir,
  };
}

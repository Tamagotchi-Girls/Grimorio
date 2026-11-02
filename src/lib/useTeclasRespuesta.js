import { useEffect, useRef } from "react";
import { indiceDeTecla } from "./teclado.js";

// Teclas para contestar, compartidas por Tema y Simulacro. Se suscribe a `keydown` una sola vez mientras
// `activo`, y lee los manejadores y `totalOpciones` de una ref, así siempre usan el estado del último render.
//   onNumero(indice, evento)  una tecla 1…totalOpciones (indice desde 0)
//   onEnter(evento)           Enter
//   onFlecha(direccion, evento)  →  (+1) y ←  (-1)
// Cada manejador decide si hace caso y si llama a `evento.preventDefault()`.
export function useTeclasRespuesta({ activo, totalOpciones, onNumero, onEnter, onFlecha }) {
  const actual = useRef({});
  useEffect(() => { actual.current = { totalOpciones, onNumero, onEnter, onFlecha }; });
  useEffect(() => {
    if (!activo) return;
    const alPulsar = (e) => {
      const { totalOpciones: total, onNumero: numero, onEnter: enter, onFlecha: flecha } = actual.current;
      const opcion = indiceDeTecla(e.key, total);
      if (opcion !== null) numero?.(opcion, e);
      else if (e.key === "Enter") enter?.(e);
      else if (e.key === "ArrowRight") flecha?.(1, e);
      else if (e.key === "ArrowLeft") flecha?.(-1, e);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [activo]);
}

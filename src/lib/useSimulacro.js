import { useEffect, useState } from "react";
import { useContenido } from "../data/ContenidoContext.jsx";
import { calificar, nuevoSimulacro, respuestasARegistrar } from "./simulacro.js";
import { irAlInicio } from "./scroll.js";
import { useTeclasRespuesta } from "./useTeclasRespuesta.js";

// Texto del cuadro "¿Terminar?": cuántas faltan por responder y cuántas se marcaron para revisar.
export function mensajeConfirmacion(contestadas, total, marcadas) {
  const estado = contestadas < total ? `Te faltan ${total - contestadas} preguntas sin responder. Cuentan como incorrectas.` : "Respondiste todo.";
  const revisar = marcadas > 0 ? `Tienes ${marcadas} marcadas para revisar. ` : "";
  return `${estado} ${revisar}¿Terminar y ver tu calificación?`;
}

// Estado y lógica del simulacro. La fase se deriva: sin reactivos → "intro"; con reactivos y sin resultado →
// "jugando"; con resultado → "resultados". `prog` es el de useProgreso (registrarVarias y guardarSimulacro).
export function useSimulacro(prog) {
  const { TEMAS, PREGUNTAS } = useContenido();
  const [reactivos, setReactivos] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [marcadas, setMarcadas] = useState({});
  const [i, setI] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const fase = resultado ? "resultados" : reactivos.length > 0 ? "jugando" : "intro";
  const contestadas = Object.keys(respuestas).length;
  const totalMarcadas = Object.values(marcadas).filter(Boolean).length;

  const empezar = () => {
    setReactivos(nuevoSimulacro(TEMAS, PREGUNTAS));
    setRespuestas({}); setMarcadas({}); setI(0); setConfirmando(false); setResultado(null);
  };
  const responder = (opcion) => setRespuestas((r) => ({ ...r, [i]: opcion }));
  const alternarMarca = () => setMarcadas((m) => ({ ...m, [i]: !m[i] }));
  const irA = (k) => { if (k >= 0 && k < reactivos.length) setI(k); };
  const terminar = () => {
    const res = { fecha: new Date().toISOString(), ...calificar(reactivos, respuestas) };
    prog.registrarVarias(respuestasARegistrar(reactivos, respuestas));
    prog.guardarSimulacro(res);
    setResultado(res);
  };

  // los resultados se ven desde arriba (la calificación grande), no donde estaba el cuadro de confirmar
  useEffect(() => { if (resultado) irAlInicio(); }, [resultado]);

  useTeclasRespuesta({
    activo: fase === "jugando",
    totalOpciones: reactivos[i]?.opciones.length ?? 0,
    onNumero: (opcion, e) => { e.preventDefault(); responder(opcion); },
    onFlecha: (direccion) => irA(i + direccion),
  });

  return {
    fase, reactivos, respuestas, marcadas, i, contestadas, totalMarcadas, confirmando, resultado,
    reactivo: reactivos[i], ultima: i === reactivos.length - 1,
    empezar, responder, alternarMarca, irA, terminar,
    pedirConfirmar: () => setConfirmando(true),
    cancelarConfirmar: () => setConfirmando(false),
  };
}

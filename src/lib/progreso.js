import { useCallback, useEffect, useState } from "react";
import { PREGUNTAS } from "../data/contenido.js";
import { claveProgreso, escribirJSON, leerJSON } from "./almacenamiento.js";

const VACIO = { xp: 0, preguntas: {}, simulacros: [], diasEstudio: [] };
const hoy = () => new Date().toISOString().slice(0, 10);
const conDia = (dias = []) => [...new Set([...dias, hoy()])].slice(-90);

export function leerProgreso(materia) {
  const d = leerJSON(claveProgreso(materia));
  return d ? { ...VACIO, ...d } : VACIO;
}

export const guardarProgreso = (materia, datos) => escribirJSON(claveProgreso(materia), datos);

export const XP_POR_ACIERTO = 10;
export const XP_POR_NIVEL = 100;

export function useProgreso(materia = "PE") {
  const [datos, setDatos] = useState(() => leerProgreso(materia));

  useEffect(() => { guardarProgreso(materia, datos); }, [datos, materia]);

  const registrar = useCallback((id, acierto) => {
    setDatos(d => {
      const prev = d.preguntas[id] || { intentos: 0, aciertos: 0 };
      return {
        ...d,
        xp: d.xp + (acierto ? XP_POR_ACIERTO : 0),
        diasEstudio: conDia(d.diasEstudio),
        preguntas: {
          ...d.preguntas,
          [id]: { intentos: prev.intentos + 1, aciertos: prev.aciertos + (acierto ? 1 : 0), ultimo: acierto }
        }
      };
    });
  }, []);

  const guardarSimulacro = useCallback((resultado) => {
    setDatos(d => ({ ...d, diasEstudio: conDia(d.diasEstudio), simulacros: [...d.simulacros, resultado].slice(-10) }));
  }, []);

  const reiniciar = useCallback(() => setDatos(VACIO), []);

  const nivel = 1 + Math.floor(datos.xp / XP_POR_NIVEL);
  const xpNivel = datos.xp % XP_POR_NIVEL;
  const dominadas = PREGUNTAS.filter(p => datos.preguntas[p.id]?.ultimo).length;
  const racha = (() => {
    const dias = new Set(datos.diasEstudio || []);
    let n = 0;
    const fecha = new Date();
    while (dias.has(fecha.toISOString().slice(0, 10))) {
      n++;
      fecha.setDate(fecha.getDate() - 1);
    }
    return Math.max(1, n);
  })();

  const estadoTema = (temaId) => {
    const ps = PREGUNTAS.filter(p => p.tema === temaId);
    return ps.map(p => {
      const r = datos.preguntas[p.id];
      return !r ? "nada" : r.ultimo ? "ok" : "mal";
    });
  };

  return { datos, registrar, guardarSimulacro, reiniciar, nivel, xpNivel, dominadas, racha, estadoTema };
}

// Baraja una copia (Fisher-Yates).
export function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prepara un reactivo con las opciones en orden aleatorio.
export function prepararReactivo(p) {
  const orden = barajar(p.opciones.map((_, i) => i));
  return { ...p, opcionesBarajadas: orden.map(i => ({ texto: p.opciones[i], correcta: i === p.correcta })) };
}

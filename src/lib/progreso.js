import { useCallback, useEffect, useState } from "react";
import { CONTENIDO } from "../data/contenido.js";
import { useContenido } from "../data/ContenidoContext.jsx";
import { claveProgreso, escribirJSON, leerJSON } from "./almacenamiento.js";
import { MAX_DIAS_RACHA, MAX_SIMULACROS } from "./constantes.js";
import { XP_POR_ACIERTO, nivelDe, xpEnNivel } from "./nivel.js";
import { normalizarProgreso, progresoVacio } from "./validacion.js";

const hoy = () => new Date().toISOString().slice(0, 10);
const conDia = (dias = []) => [...new Set([...dias, hoy()])].slice(-MAX_DIAS_RACHA);

// Progreso después de responder cada [id, acierto] de `lista`, en orden: suma el XP de los aciertos, cuenta intentos
// y aciertos por reactivo, y añade hoy a los días de estudio. No modifica `datos`.
export function registrarRespuestas(datos, lista) {
  if (lista.length === 0) return datos;
  const preguntas = { ...datos.preguntas };
  let xp = datos.xp;
  for (const [id, acierto] of lista) {
    const prev = preguntas[id] || { intentos: 0, aciertos: 0 };
    xp += acierto ? XP_POR_ACIERTO : 0;
    preguntas[id] = { intentos: prev.intentos + 1, aciertos: prev.aciertos + (acierto ? 1 : 0), ultimo: acierto };
  }
  return { ...datos, xp, diasEstudio: conDia(datos.diasEstudio), preguntas };
}

export const leerProgreso =(materia) => normalizarProgreso(leerJSON(claveProgreso(materia)), materia);

export const guardarProgreso = (materia, datos) => escribirJSON(claveProgreso(materia), datos);

// Progreso de la materia activa (la del ContenidoProvider). Si la materia cambia sin que el componente se
// desmonte, se carga el progreso de la nueva materia en ese mismo render, antes de que se guarde nada.
export function useProgreso() {
  const { materia, PREGUNTAS } = useContenido();
  const [estado, setEstado] = useState(() => ({ materia, datos: leerProgreso(materia) }));
  let actual = estado;
  if (estado.materia !== materia) {
    actual = { materia, datos: leerProgreso(materia) };
    setEstado(actual);
  }
  const datos = actual.datos;
  const setDatos = useCallback((f) => setEstado((e) => ({ ...e, datos: f(e.datos) })), []);

  useEffect(() => { guardarProgreso(materia, datos); }, [datos, materia]);

  const registrar = useCallback((id, acierto) => setDatos(d => registrarRespuestas(d, [[id, acierto]])), [setDatos]);

  // Varias respuestas de golpe ([[id, acierto], …]): una sola actualización del progreso (p. ej. al terminar un simulacro).
  const registrarVarias = useCallback((lista) => setDatos(d => registrarRespuestas(d, lista)), [setDatos]);

  const guardarSimulacro = useCallback((resultado) => {
    setDatos(d => ({ ...d, diasEstudio: conDia(d.diasEstudio), simulacros: [...d.simulacros, resultado].slice(-MAX_SIMULACROS) }));
  }, [setDatos]);

  const reiniciar = useCallback(() => setDatos(() => progresoVacio()), [setDatos]);

  const nivel = nivelDe(datos.xp);
  const xpNivel = xpEnNivel(datos.xp);
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

  const estadoTema = (temaId) => PREGUNTAS.filter(p => p.tema === temaId).map(p => estadoPregunta(datos, p.id));
  const resumenDeTema = (temaId) => resumenTema(datos, PREGUNTAS, temaId);

  return { datos, registrar, registrarVarias, guardarSimulacro, reiniciar, nivel, xpNivel, dominadas, racha, estadoTema, resumenTema: resumenDeTema };
}

// "nada" (sin intentar), "ok" (bien la última vez) o "mal" (falló la última vez).
const estadoPregunta = (datos, id) => {
  const r = datos.preguntas[id];
  return !r ? "nada" : r.ultimo ? "ok" : "mal";
};

// Cuántos reactivos del tema están bien (`ok`), cuántos tiene (`total`) y si ya están todos (`completo`).
export function resumenTema(datos, preguntas, temaId) {
  const delTema = preguntas.filter(p => p.tema === temaId);
  const ok = delTema.filter(p => estadoPregunta(datos, p.id) === "ok").length;
  return { ok, total: delTema.length, completo: ok === delTema.length };
}

// Nivel y porcentaje de dominio de una materia, leído del almacenamiento (o de `datos`, ya normalizados).
export function resumenMateria(id, datos = leerProgreso(id)) {
  const preguntas = CONTENIDO[id]?.PREGUNTAS ?? [];
  const dominadas = preguntas.filter(p => datos.preguntas[p.id]?.ultimo).length;
  const dominio = preguntas.length ? Math.round((dominadas / preguntas.length) * 100) : 0;
  return { nivel: nivelDe(datos.xp), dominadas, total: preguntas.length, dominio };
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

// Normalización de perfil y progreso. La usan igual la lectura de localStorage y la importación por
// enlace: nada que venga de fuera (almacenamiento editado a mano, enlace ajeno) llega a la app sin
// pasar por aquí. Siempre devuelven datos nuevos y bien formados; lo irrecuperable se descarta.
import { CONTENIDO } from "../data/contenido.js";
import { normalizarHada } from "../components/Hada.jsx";

export const LIMITES = Object.freeze({
  xp: 1_000_000,
  intentos: 100_000,
  simulacros: 10,
  diasEstudio: 90,
  nombre: 32,
  totalSimulacro: 500,
});

const MATERIAS = Object.keys(CONTENIDO);
const idsValidos = Object.fromEntries(MATERIAS.map((m) => [m, new Set(CONTENIDO[m].PREGUNTAS.map((p) => p.id))]));

const esObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const NUMERO_TEXTO = /^\s*\d+(\.\d+)?\s*$/;
const aNumero = (v) => (typeof v === "string" && NUMERO_TEXTO.test(v) ? Number(v) : v);

// Entero >= 0 (acepta números o su texto, p. ej. "12"); null si no sirve.
function aEntero(v, max = Number.MAX_SAFE_INTEGER) {
  const n = aNumero(v);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
}

export const progresoVacio = () => ({ xp: 0, preguntas: {}, simulacros: [], diasEstudio: [] });

function normalizarXp(v) {
  const n = aNumero(v);
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), LIMITES.xp);
}

function normalizarPreguntas(v, materia) {
  const salida = {};
  if (!esObjeto(v)) return salida;
  const ids = idsValidos[materia];
  for (const id of Object.keys(v)) {
    if (!ids.has(id) || !esObjeto(v[id])) continue;
    const intentos = aEntero(v[id].intentos, LIMITES.intentos);
    const aciertos = aEntero(v[id].aciertos, LIMITES.intentos);
    if (intentos === null || aciertos === null || intentos < 1) continue;
    const buenos = Math.min(aciertos, intentos);
    // `ultimo` no puede ser acierto si nunca se acertó
    salida[id] = { intentos, aciertos: buenos, ultimo: v[id].ultimo === true && buenos > 0 };
  }
  return salida;
}

function normalizarPorTema(v) {
  const salida = {};
  if (!esObjeto(v)) return salida;
  for (const k of Object.keys(v)) {
    if (!/^\d{1,3}$/.test(k) || !esObjeto(v[k])) continue;
    const ok = aEntero(v[k].ok, LIMITES.totalSimulacro);
    const total = aEntero(v[k].total, LIMITES.totalSimulacro);
    if (ok !== null && total !== null && ok <= total) salida[k] = { ok, total };
  }
  return salida;
}

function normalizarSimulacros(v) {
  if (!Array.isArray(v)) return [];
  const salida = [];
  for (const s of v) {
    if (!esObjeto(s)) continue;
    const ms = typeof s.fecha === "string" && s.fecha.length <= 40 ? Date.parse(s.fecha) : NaN;
    const aciertos = aEntero(s.aciertos, LIMITES.totalSimulacro);
    const total = aEntero(s.total, LIMITES.totalSimulacro);
    const calificacion = aNumero(s.calificacion);
    if (Number.isNaN(ms) || aciertos === null || total === null || total < 1 || aciertos > total) continue;
    if (typeof calificacion !== "number" || !Number.isFinite(calificacion) || calificacion < 0 || calificacion > 100) continue;
    salida.push({
      fecha: new Date(ms).toISOString(),
      aciertos,
      total,
      calificacion: Math.round(calificacion),
      porTema: normalizarPorTema(s.porTema),
    });
  }
  return salida.slice(-LIMITES.simulacros);
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const diaReal = (s) => {
  if (typeof s !== "string" || !DIA.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

function normalizarDias(v, ahora) {
  if (!Array.isArray(v)) return [];
  // un día de margen por la zona horaria: el reloj de otro dispositivo puede ir adelantado
  const limite = new Date(ahora.getTime() + 86_400_000).toISOString().slice(0, 10);
  const dias = new Set(v.filter((s) => diaReal(s) && s <= limite));
  return [...dias].sort().slice(-LIMITES.diasEstudio);
}

// `materia` decide qué ids de pregunta son válidos ("PE" o "FP"); `ahora` solo se usa para descartar fechas futuras.
export function normalizarProgreso(datos, materia = "PE", ahora = new Date()) {
  if (!esObjeto(datos)) return progresoVacio();
  return {
    xp: normalizarXp(datos.xp),
    preguntas: normalizarPreguntas(datos.preguntas, idsValidos[materia] ? materia : "PE"),
    simulacros: normalizarSimulacros(datos.simulacros),
    diasEstudio: normalizarDias(datos.diasEstudio, ahora),
  };
}

// Devuelve { nombre, avatar } o null si no hay un nombre utilizable (la app vuelve a pedirlo).
// El campo `hada` que escribían versiones anteriores se ignora.
export function normalizarPerfil(datos) {
  if (!esObjeto(datos) || typeof datos.nombre !== "string") return null;
  const limpio = datos.nombre.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  const nombre = Array.from(limpio).slice(0, LIMITES.nombre).join("").trim();
  if (!nombre) return null;
  return { nombre, avatar: normalizarHada(datos.avatar) };
}

// Une el progreso de este dispositivo con el entrante: más XP, preguntas de ambos (gana el entrante),
// últimos simulacros y días de estudio sin repetir. Ambos deben venir ya normalizados.
export function combinarProgreso(local, entrante, materia = "PE") {
  return normalizarProgreso({
    xp: Math.max(local.xp, entrante.xp),
    preguntas: { ...local.preguntas, ...entrante.preguntas },
    simulacros: [...local.simulacros, ...entrante.simulacros],
    diasEstudio: [...local.diasEstudio, ...entrante.diasEstudio],
  }, materia);
}

// Datos de un enlace de transferencia ya descomprimidos → { perfil, progreso: { PE, FP } } o null.
export function normalizarTransferencia(datos) {
  if (!esObjeto(datos) || datos.version !== 1 || !esObjeto(datos.progreso)) return null;
  const perfil = normalizarPerfil(datos.perfil);
  if (!perfil) return null;
  return { perfil, progreso: Object.fromEntries(MATERIAS.map((m) => [m, normalizarProgreso(datos.progreso[m], m)])) };
}

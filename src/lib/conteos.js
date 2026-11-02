// Cantidades y textos que salen de los datos de la materia (temas y reactivos) y del tamaño del simulacro,
// para que no haya un "60", un "10" o un "6" escrito a mano que se desfase si cambia el contenido.
import { PREGUNTAS_POR_SIMULACRO } from "./constantes.js";
import { dosDigitos } from "./formato.js";

// Reactivos por tema si todos los temas tienen los mismos; null si no.
export function reactivosPorTema(temas, preguntas) {
  const cuentas = temas.map((t) => preguntas.filter((p) => p.tema === t.id).length);
  return cuentas.length > 0 && cuentas.every((c) => c === cuentas[0]) ? cuentas[0] : null;
}

// Reactivos de cada tema en un simulacro, y total del simulacro (si no se reparten parejo, los que sí caben).
export const reactivosPorTemaEnSimulacro = (temas) => Math.floor(PREGUNTAS_POR_SIMULACRO / temas.length);
export const totalSimulacro = (temas) => reactivosPorTemaEnSimulacro(temas) * temas.length;

export const textoResumenMateria = (temas, preguntas) => `${preguntas.length} reactivos de los ${temas.length} temas del programa.`;

export function textoCaminoTemas(temas, preguntas) {
  const n = reactivosPorTema(temas, preguntas);
  return `Apuntes y ${n === null ? "" : `${n} `}reactivos por tema, con explicación al instante.`;
}

export const textoCaminoSimulacro = (temas) => `${totalSimulacro(temas)} reactivos al azar. Calificación al final.`;

export const textoReglaSimulacro = (temas) =>
  `${totalSimulacro(temas)} reactivos al azar: ${reactivosPorTemaEnSimulacro(temas)} de cada uno de los ${temas.length} temas.`;

// El tema que sigue en el arreglo (no `id + 1`: los ids no tienen por qué ser consecutivos); undefined si es el último.
export const temaSiguiente = (temas, id) => {
  const pos = temas.findIndex((t) => t.id === id);
  return pos < 0 ? undefined : temas[pos + 1];
};

export const textoNumeroDeTema = (id, temas) => `Tema ${dosDigitos(id)} de ${temas.length}`;

export const textoTemasCompletos = (completos, temas) => `${completos} de ${temas.length} temas completos`;

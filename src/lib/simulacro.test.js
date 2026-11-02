import { describe, expect, it } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { totalSimulacro } from "./conteos.js";
import { nuevoSimulacro } from "./simulacro.js";

describe.each(Object.entries(CONTENIDO))("nuevoSimulacro %s", (materia, { TEMAS, PREGUNTAS }) => {
  const sim = nuevoSimulacro(TEMAS, PREGUNTAS);
  const ids = new Set(PREGUNTAS.map((p) => p.id));
  it("tiene el total que dice conteos y solo reactivos de la materia", () => {
    expect(sim).toHaveLength(totalSimulacro(TEMAS));
    expect(sim.every((r) => ids.has(r.id))).toBe(true);
    expect(new Set(sim.map((r) => r.id)).size).toBe(sim.length);
  });
  it("reparte parejo entre los temas", () => {
    const porTema = TEMAS.map((t) => sim.filter((r) => r.tema === t.id).length);
    expect(new Set(porTema).size).toBe(1);
  });
  it("cada reactivo trae las 4 opciones barajadas con una sola correcta", () => {
    for (const r of sim) {
      expect(r.opcionesBarajadas).toHaveLength(4);
      expect(r.opcionesBarajadas.filter((o) => o.correcta)).toHaveLength(1);
      expect(r.opcionesBarajadas.find((o) => o.correcta).texto).toBe(r.opciones[r.correcta]);
    }
  });
});

// ───────── calificar y compañía (reactivos a mano: la correcta se marca con `correcta`)
import { calificar, esCorrecta, respuestasARegistrar, temasFlojos } from "./simulacro.js";

const reactivo = (id, tema, correcta) => ({
  id, tema,
  opcionesBarajadas: [0, 1, 2, 3].map((k) => ({ texto: String(k), correcta: k === correcta })),
});
// 4 reactivos: dos del tema 1 (correctas: 0 y 2) y dos del tema 2 (correctas: 1 y 3)
const R = [reactivo("a", 1, 0), reactivo("b", 1, 2), reactivo("c", 2, 1), reactivo("d", 2, 3)];

describe("esCorrecta", () => {
  it("compara con la opción correcta; sin respuesta es incorrecta", () => {
    expect(esCorrecta(R[0], 0)).toBe(true);
    expect(esCorrecta(R[0], 1)).toBe(false);
    expect(esCorrecta(R[0], undefined)).toBe(false);
  });
});

describe("calificar", () => {
  it("todo bien: 100 y todos los temas completos", () => {
    expect(calificar(R, { 0: 0, 1: 2, 2: 1, 3: 3 })).toEqual({
      aciertos: 4, total: 4, calificacion: 100, porTema: { 1: { ok: 2, total: 2 }, 2: { ok: 2, total: 2 } },
    });
  });
  it("sin responder nada: 0, pero cada tema cuenta su total", () => {
    expect(calificar(R, {})).toEqual({
      aciertos: 0, total: 4, calificacion: 0, porTema: { 1: { ok: 0, total: 2 }, 2: { ok: 0, total: 2 } },
    });
  });
  it("mezcla de aciertos, fallos y omitidas", () => {
    // a bien, b mal, c omitida, d bien → 2 de 4
    expect(calificar(R, { 0: 0, 1: 0, 3: 3 })).toEqual({
      aciertos: 2, total: 4, calificacion: 50, porTema: { 1: { ok: 1, total: 2 }, 2: { ok: 1, total: 2 } },
    });
  });
  it("redondea la calificación (1 de 3 → 33, 2 de 3 → 67)", () => {
    const tres = R.slice(0, 3);
    expect(calificar(tres, { 0: 0 }).calificacion).toBe(33);
    expect(calificar(tres, { 0: 0, 1: 2 }).calificacion).toBe(67);
  });
  it("las claves salen en el orden que se guarda: aciertos, total, calificacion, porTema", () => {
    expect(Object.keys(calificar(R, {}))).toEqual(["aciertos", "total", "calificacion", "porTema"]);
  });
  it("no modifica lo que recibe", () => {
    const respuestas = { 0: 0 };
    calificar(R, respuestas);
    expect(respuestas).toEqual({ 0: 0 });
  });
});

describe("respuestasARegistrar", () => {
  it("solo las respondidas, con su acierto, en orden", () => {
    expect(respuestasARegistrar(R, { 0: 0, 1: 0, 3: 3 })).toEqual([["a", true], ["b", false], ["d", true]]);
    expect(respuestasARegistrar(R, {})).toEqual([]);
  });
});

describe("temasFlojos", () => {
  const temas = [{ id: 1 }, { id: 2 }, { id: 3 }];
  it("los temas con fallos, en el orden de los temas; ignora los que no salieron", () => {
    expect(temasFlojos(temas, { 2: { ok: 1, total: 2 }, 1: { ok: 0, total: 2 } })).toEqual([{ id: 1 }, { id: 2 }]);
    expect(temasFlojos(temas, { 1: { ok: 2, total: 2 } })).toEqual([]);
  });
});

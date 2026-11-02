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

import { describe, expect, it } from "vitest";
import { CONTENIDO } from "./contenido.js";

const TIPOS = ["concepto", "imprime", "error", "completa"];

// Reglas de AGENTS.md sobre el formato de reactivo, aplicadas a cada materia.
describe.each(Object.entries(CONTENIDO))("contenido %s", (materia, { TEMAS, PREGUNTAS }) => {
  const idsTema = new Set(TEMAS.map((t) => t.id));

  it("tiene temas con id único y apuntes", () => {
    expect(idsTema.size).toBe(TEMAS.length);
    for (const t of TEMAS) {
      expect(t.nombre, `tema ${t.id}`).toBeTruthy();
      expect(t.corto, `tema ${t.id}`).toBeTruthy();
      expect(t.apuntes.length, `apuntes del tema ${t.id}`).toBeGreaterThan(0);
      expect(t.ejemplo, `ejemplo del tema ${t.id}`).toBeTruthy();
    }
  });

  it("tiene ids de reactivo únicos", () => {
    const ids = PREGUNTAS.map((p) => p.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("cada tema tiene reactivos y todos son del mismo número", () => {
    const porTema = TEMAS.map((t) => PREGUNTAS.filter((p) => p.tema === t.id).length);
    expect(Math.min(...porTema), `reactivos por tema: ${porTema}`).toBeGreaterThan(0);
    expect(new Set(porTema).size, `reactivos por tema: ${porTema}`).toBe(1);
  });

  it.each(PREGUNTAS.map((p) => [p.id, p]))("reactivo %s tiene el formato correcto", (_id, p) => {
    expect(TIPOS).toContain(p.tipo);
    expect(idsTema.has(p.tema), `tema ${p.tema} no existe`).toBe(true);
    expect(p.pregunta).toBeTruthy();
    expect(p.explicacion).toBeTruthy();
    expect(p.opciones).toHaveLength(4);
    expect(new Set(p.opciones).size, "opciones repetidas").toBe(4);
    expect(Number.isInteger(p.correcta) && p.correcta >= 0 && p.correcta < 4).toBe(true);
    if (p.tipo === "imprime") expect(p.codigo, "un reactivo imprime necesita código").toBeTruthy();
  });
});

describe("ids por materia", () => {
  it("los reactivos de FP llevan el prefijo fp-", () => {
    for (const p of CONTENIDO.FP.PREGUNTAS) expect(p.id.startsWith("fp-"), p.id).toBe(true);
  });

  it("los ids de PE y de FP no chocan", () => {
    const pe = new Set(CONTENIDO.PE.PREGUNTAS.map((p) => p.id));
    expect(CONTENIDO.FP.PREGUNTAS.filter((p) => pe.has(p.id))).toEqual([]);
  });
});

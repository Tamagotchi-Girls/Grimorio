import { describe, expect, it } from "vitest";
import { barajar, prepararReactivo, XP_POR_ACIERTO, XP_POR_NIVEL } from "./progreso.js";
import { CONTENIDO } from "../data/contenido.js";

describe("barajar", () => {
  it("devuelve una permutación sin tocar el original", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const copia = [...original];
    const resultado = barajar(original);
    expect(original).toEqual(copia);
    expect([...resultado].sort((a, b) => a - b)).toEqual(copia);
  });
});

describe("prepararReactivo", () => {
  it("conserva las 4 opciones y exactamente una correcta, la misma que el original", () => {
    for (const { PREGUNTAS } of Object.values(CONTENIDO)) {
      for (const p of PREGUNTAS) {
        const r = prepararReactivo(p);
        expect(r.opcionesBarajadas.map((o) => o.texto).sort()).toEqual([...p.opciones].sort());
        const correctas = r.opcionesBarajadas.filter((o) => o.correcta);
        expect(correctas, p.id).toHaveLength(1);
        expect(correctas[0].texto, p.id).toBe(p.opciones[p.correcta]);
      }
    }
  });
});

describe("constantes de XP", () => {
  it("son positivas y un nivel exige varios aciertos", () => {
    expect(XP_POR_ACIERTO).toBeGreaterThan(0);
    expect(XP_POR_NIVEL).toBeGreaterThan(XP_POR_ACIERTO);
  });
});

import { describe, expect, it } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { indiceDeTecla, textoTeclas } from "./teclado.js";

describe("indiceDeTecla", () => {
  it("con 4 opciones: 1–4 → 0–3, lo demás → null (como antes: n >= 1 && n <= 4)", () => {
    expect(["1", "2", "3", "4"].map((k) => indiceDeTecla(k, 4))).toEqual([0, 1, 2, 3]);
    for (const k of ["0", "5", "9", "a", "Enter", "ArrowLeft", " ", ""]) expect(indiceDeTecla(k, 4), JSON.stringify(k)).toBeNull();
  });

  it("sigue la cantidad de opciones del reactivo", () => {
    expect(indiceDeTecla("5", 5)).toBe(4);
    expect(indiceDeTecla("5", 4)).toBeNull();
    expect(indiceDeTecla("3", 2)).toBeNull();
    expect(indiceDeTecla("1", 0)).toBeNull();
  });

  it("todos los reactivos de PE y FP tienen 4 opciones, así que las teclas siguen siendo 1–4", () => {
    for (const { PREGUNTAS } of Object.values(CONTENIDO)) for (const p of PREGUNTAS) expect(p.opciones, p.id).toHaveLength(4);
  });
});

describe("textoTeclas", () => {
  it("dice el rango de teclas del reactivo", () => {
    expect(textoTeclas(4)).toBe("Teclas 1–4 para responder");
    expect(textoTeclas(5)).toBe("Teclas 1–5 para responder");
  });
});

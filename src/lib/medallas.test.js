import { describe, expect, it } from "vitest";
import { UMBRALES_SIMULACRO, UMBRALES_TEMA, medallaDeSimulacro, medallaDeTema, medallaPorPorcentaje } from "./medallas.js";

// Reglas ORIGINALES, copiadas tal cual de Tema.jsx y Simulacro.jsx antes de centralizarlas.
const medallaTemaAntes = (aciertos, total) => (aciertos === total ? "copa" : aciertos >= 4 ? "estrella" : "corazon");
const medallaSimulacroAntes = (calificacion) => (calificacion >= 90 ? "copa" : calificacion >= 60 ? "estrella" : "corazon");

describe("medallaPorPorcentaje", () => {
  const u = { copa: 90, estrella: 60 };
  it("cada medalla se gana justo en su umbral (incluido)", () => {
    expect(medallaPorPorcentaje(100, u)).toBe("copa");
    expect(medallaPorPorcentaje(90, u)).toBe("copa");
    expect(medallaPorPorcentaje(89.99, u)).toBe("estrella");
    expect(medallaPorPorcentaje(60, u)).toBe("estrella");
    expect(medallaPorPorcentaje(59.99, u)).toBe("corazon");
    expect(medallaPorPorcentaje(0, u)).toBe("corazon");
  });
  it("los umbrales de simulacro y de tema son los de siempre", () => {
    expect(UMBRALES_SIMULACRO).toEqual({ copa: 90, estrella: 60 });
    expect(UMBRALES_TEMA.copa).toBe(100);
    expect(UMBRALES_TEMA.estrella).toBe(200 / 3);
  });
});

describe("medalla de tema: idéntica a la regla anterior", () => {
  it("con 6 reactivos, para 0..6 aciertos (`>= 4` equivale a `>= 2/3`)", () => {
    const esperado = ["corazon", "corazon", "corazon", "corazon", "estrella", "estrella", "copa"];
    for (let aciertos = 0; aciertos <= 6; aciertos++) {
      expect(medallaDeTema(aciertos, 6), `${aciertos}/6`).toBe(medallaTemaAntes(aciertos, 6));
      expect(medallaDeTema(aciertos, 6), `${aciertos}/6`).toBe(esperado[aciertos]);
    }
  });

  it("4 de 6 es exactamente dos tercios: ni un flotante de más ni de menos", () => {
    expect((100 * 4) / 6).toBe(200 / 3);
    for (const [a, t] of [[2, 3], [4, 6], [6, 9], [8, 12], [20, 30]]) expect(medallaDeTema(a, t), `${a}/${t}`).toBe("estrella");
    expect(medallaDeTema(3, 6)).toBe("corazon"); // 50 %
    expect(medallaDeTema(13, 20)).toBe("corazon"); // 65 %, por debajo de 2/3
    expect(medallaDeTema(14, 20)).toBe("estrella"); // 70 %
  });

  it("un tema sin reactivos sigue dando copa, como `aciertos === total`", () => {
    expect(medallaDeTema(0, 0)).toBe(medallaTemaAntes(0, 0));
    expect(medallaDeTema(0, 0)).toBe("copa");
  });
});

describe("medalla de simulacro: idéntica a la regla anterior", () => {
  it("con 20 reactivos, para 0..20 aciertos (calificación = round(aciertos / 20 * 100))", () => {
    for (let aciertos = 0; aciertos <= 20; aciertos++) {
      const calificacion = Math.round((aciertos / 20) * 100); // así la calcula Simulacro.jsx
      expect(medallaDeSimulacro(calificacion), `${aciertos}/20 → ${calificacion}`).toBe(medallaSimulacroAntes(calificacion));
    }
    expect(medallaDeSimulacro(Math.round((17 / 20) * 100))).toBe("estrella");
    expect(medallaDeSimulacro(Math.round((18 / 20) * 100))).toBe("copa");
    expect(medallaDeSimulacro(Math.round((11 / 20) * 100))).toBe("corazon");
    expect(medallaDeSimulacro(Math.round((12 / 20) * 100))).toBe("estrella");
  });

  it("para cualquier calificación entera de 0 a 100", () => {
    for (let c = 0; c <= 100; c++) expect(medallaDeSimulacro(c), String(c)).toBe(medallaSimulacroAntes(c));
  });
});

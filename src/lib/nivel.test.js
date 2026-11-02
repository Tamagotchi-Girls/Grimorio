import { describe, expect, it } from "vitest";
import { XP_POR_ACIERTO, XP_POR_NIVEL, nivelDe, xpEnNivel } from "./nivel.js";

describe("constantes de XP", () => {
  it("son positivas y un nivel exige varios aciertos", () => {
    expect(XP_POR_ACIERTO).toBeGreaterThan(0);
    expect(XP_POR_NIVEL).toBeGreaterThan(XP_POR_ACIERTO);
    expect(XP_POR_NIVEL % XP_POR_ACIERTO).toBe(0); // un acierto nunca deja el XP a medias de un nivel
  });
});

describe("nivelDe", () => {
  it("empieza en 1 y sube cada XP_POR_NIVEL", () => {
    expect(nivelDe(0)).toBe(1);
    expect(nivelDe(XP_POR_NIVEL - 1)).toBe(1);
    expect(nivelDe(XP_POR_NIVEL)).toBe(2);
    expect(nivelDe(2 * XP_POR_NIVEL - 1)).toBe(2);
    expect(nivelDe(235)).toBe(3);
    expect(nivelDe(1_000_000)).toBe(1 + 1_000_000 / XP_POR_NIVEL);
  });

  it("un xp inválido cuenta como 0 y los decimales se truncan", () => {
    for (const malo of [undefined, null, NaN, -1, -500, "abc", {}, [], Infinity * 0]) expect(nivelDe(malo), String(malo)).toBe(1);
    expect(nivelDe(99.9)).toBe(1);
    expect(nivelDe(100.4)).toBe(2);
    expect(nivelDe("250")).toBe(3);
  });
});

describe("xpEnNivel", () => {
  it("es el XP acumulado dentro del nivel actual", () => {
    expect(xpEnNivel(0)).toBe(0);
    expect(xpEnNivel(XP_POR_NIVEL - 1)).toBe(XP_POR_NIVEL - 1);
    expect(xpEnNivel(XP_POR_NIVEL)).toBe(0);
    expect(xpEnNivel(235)).toBe(35);
  });

  it("un xp inválido cuenta como 0", () => {
    for (const malo of [undefined, null, NaN, -1, "abc"]) expect(xpEnNivel(malo), String(malo)).toBe(0);
    expect(xpEnNivel(35.7)).toBe(35);
  });
});

describe("equivale a las fórmulas que estaban a mano", () => {
  it("1 + floor(xp / 100) y xp % 100, para todo xp de 0 a 2000", () => {
    for (let xp = 0; xp <= 2000; xp++) {
      expect(nivelDe(xp), `nivel ${xp}`).toBe(1 + Math.floor(xp / 100));
      expect(xpEnNivel(xp), `xpNivel ${xp}`).toBe(xp % 100);
      expect((nivelDe(xp) - 1) * XP_POR_NIVEL + xpEnNivel(xp)).toBe(xp);
    }
  });
});

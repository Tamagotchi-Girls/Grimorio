import { describe, expect, it } from "vitest";
import { saludoSegunHora } from "./saludo.js";

const a = (h, m = 0) => new Date(2026, 5, 15, h, m);

describe("saludoSegunHora", () => {
  it("antes de las 12:00 es de día", () => {
    expect(saludoSegunHora(a(0, 0))).toBe("¡Buenos días!");
    expect(saludoSegunHora(a(5, 30))).toBe("¡Buenos días!");
    expect(saludoSegunHora(a(11, 59))).toBe("¡Buenos días!");
  });
  it("de las 12:00 a las 18:59 es de tarde", () => {
    expect(saludoSegunHora(a(12, 0))).toBe("¡Buenas tardes!");
    expect(saludoSegunHora(a(15, 0))).toBe("¡Buenas tardes!");
    expect(saludoSegunHora(a(18, 59))).toBe("¡Buenas tardes!");
  });
  it("desde las 19:00 es de noche", () => {
    expect(saludoSegunHora(a(19, 0))).toBe("¡Buenas noches!");
    expect(saludoSegunHora(a(23, 59))).toBe("¡Buenas noches!");
  });
});

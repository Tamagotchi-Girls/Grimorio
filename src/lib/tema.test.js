import { afterEach, describe, expect, it, vi } from "vitest";
import { temaInicial } from "./tema.js";

const entorno = (guardado, oscuro) => {
  vi.stubGlobal("localStorage", { getItem: () => guardado });
  vi.stubGlobal("matchMedia", () => ({ matches: oscuro }));
};
afterEach(() => vi.unstubAllGlobals());

describe("temaInicial", () => {
  it("respeta lo guardado", () => {
    entorno("light", true);
    expect(temaInicial()).toBe("light");
    entorno("dark", false);
    expect(temaInicial()).toBe("dark");
  });
  it("sin guardado válido usa la preferencia del sistema", () => {
    entorno(null, true);
    expect(temaInicial()).toBe("dark");
    entorno("naranja", false);
    expect(temaInicial()).toBe("light");
  });
});

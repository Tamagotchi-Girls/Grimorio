import { afterEach, describe, expect, it, vi } from "vitest";
import { modoColorInicial } from "./modoColor.js";

const entorno = (guardado, oscuro) => {
  vi.stubGlobal("localStorage", { getItem: () => guardado });
  vi.stubGlobal("matchMedia", () => ({ matches: oscuro }));
};
afterEach(() => vi.unstubAllGlobals());

describe("modoColorInicial", () => {
  it("respeta lo guardado", () => {
    entorno("light", true);
    expect(modoColorInicial()).toBe("light");
    entorno("dark", false);
    expect(modoColorInicial()).toBe("dark");
  });
  it("sin guardado válido usa la preferencia del sistema", () => {
    entorno(null, true);
    expect(modoColorInicial()).toBe("dark");
    entorno("naranja", false);
    expect(modoColorInicial()).toBe("light");
  });
});

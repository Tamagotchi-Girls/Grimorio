import { afterEach, describe, expect, it, vi } from "vitest";
import { movimientoReducido } from "./movimiento.js";

describe("movimientoReducido", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("consulta prefers-reduced-motion: reduce", () => {
    const matchMedia = vi.fn((q) => ({ matches: q === "(prefers-reduced-motion: reduce)" }));
    vi.stubGlobal("matchMedia", matchMedia);
    expect(movimientoReducido()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    expect(movimientoReducido()).toBe(false);
  });

  it("si matchMedia no existe o lanza, no hay preferencia (false)", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(movimientoReducido()).toBe(false);
    vi.stubGlobal("matchMedia", () => { throw new Error("no soportado"); });
    expect(movimientoReducido()).toBe(false);
  });
});

// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTeclasRespuesta } from "./useTeclasRespuesta.js";

const pulsar = (key) => {
  const e = new KeyboardEvent("keydown", { key, cancelable: true });
  window.dispatchEvent(e);
  return e;
};
afterEach(() => vi.restoreAllMocks());

describe("useTeclasRespuesta", () => {
  it("número: llama onNumero con el índice (desde 0) y el evento; fuera de rango no hace nada", () => {
    const onNumero = vi.fn();
    renderHook(() => useTeclasRespuesta({ activo: true, totalOpciones: 4, onNumero }));
    const e = pulsar("3");
    expect(onNumero).toHaveBeenCalledWith(2, e);
    pulsar("5"); pulsar("0"); pulsar("a");
    expect(onNumero).toHaveBeenCalledTimes(1);
  });
  it("Enter y flechas llaman a su manejador (→ +1, ← -1)", () => {
    const onEnter = vi.fn(), onFlecha = vi.fn();
    renderHook(() => useTeclasRespuesta({ activo: true, totalOpciones: 4, onEnter, onFlecha }));
    pulsar("Enter"); pulsar("ArrowRight"); pulsar("ArrowLeft");
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onFlecha.mock.calls.map((c) => c[0])).toEqual([1, -1]);
  });
  it("sin manejador para una tecla no truena", () => {
    renderHook(() => useTeclasRespuesta({ activo: true, totalOpciones: 4 }));
    expect(() => { pulsar("1"); pulsar("Enter"); pulsar("ArrowLeft"); }).not.toThrow();
  });
  it("inactivo: no escucha", () => {
    const onNumero = vi.fn();
    const alta = vi.spyOn(window, "addEventListener");
    renderHook(() => useTeclasRespuesta({ activo: false, totalOpciones: 4, onNumero }));
    pulsar("1");
    expect(onNumero).not.toHaveBeenCalled();
    expect(alta.mock.calls.filter(([t]) => t === "keydown")).toHaveLength(0);
  });
  it("se suscribe UNA sola vez aunque cambien los manejadores y se vuelva a dibujar", () => {
    const alta = vi.spyOn(window, "addEventListener");
    const baja = vi.spyOn(window, "removeEventListener");
    const { rerender } = renderHook((p) => useTeclasRespuesta(p), { initialProps: { activo: true, totalOpciones: 4, onNumero: () => {} } });
    for (let k = 0; k < 5; k++) rerender({ activo: true, totalOpciones: 4, onNumero: () => {} });
    expect(alta.mock.calls.filter(([t]) => t === "keydown")).toHaveLength(1);
    expect(baja.mock.calls.filter(([t]) => t === "keydown")).toHaveLength(0);
  });
  it("usa los manejadores y el total del último render (lee de una ref)", () => {
    const viejo = vi.fn(), nuevo = vi.fn();
    const { rerender } = renderHook((p) => useTeclasRespuesta(p), { initialProps: { activo: true, totalOpciones: 2, onNumero: viejo } });
    pulsar("3");
    expect(viejo).not.toHaveBeenCalled(); // con 2 opciones, la 3 no existe
    rerender({ activo: true, totalOpciones: 4, onNumero: nuevo });
    pulsar("3");
    expect(nuevo).toHaveBeenCalledTimes(1);
    expect(viejo).not.toHaveBeenCalled();
  });
  it("al pasar a inactivo o desmontar suelta la suscripción", () => {
    const onNumero = vi.fn();
    const { rerender, unmount } = renderHook((p) => useTeclasRespuesta(p), { initialProps: { activo: true, totalOpciones: 4, onNumero } });
    rerender({ activo: false, totalOpciones: 4, onNumero });
    pulsar("1");
    expect(onNumero).not.toHaveBeenCalled();
    rerender({ activo: true, totalOpciones: 4, onNumero });
    unmount();
    pulsar("1");
    expect(onNumero).not.toHaveBeenCalled();
  });
});

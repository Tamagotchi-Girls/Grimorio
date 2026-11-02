// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTema } from "./tema.js";
import { DURACION_LEVEL_UP_MS, useAvisoNivel } from "./avisoNivel.js";

const sistemaOscuro = (oscuro) => vi.stubGlobal("matchMedia", () => ({ matches: oscuro }));
beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute("data-theme"); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("useTema", () => {
  it("sin nada guardado usa el del sistema y lo pone en <html data-theme>", () => {
    sistemaOscuro(true);
    const { result } = renderHook(() => useTema());
    expect(result.current[0]).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("lo guardado manda sobre el sistema", () => {
    sistemaOscuro(true);
    localStorage.setItem("guia-pe-tema", "light");
    expect(renderHook(() => useTema()).result.current[0]).toBe("light");
  });
  it("alternar cambia, actualiza <html> y guarda con la misma clave de siempre", () => {
    sistemaOscuro(false);
    const { result } = renderHook(() => useTema());
    act(() => result.current[1]());
    expect(result.current[0]).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("guia-pe-tema")).toBe("dark");
    act(() => result.current[1]());
    expect(result.current[0]).toBe("light");
    expect(localStorage.getItem("guia-pe-tema")).toBe("light");
  });
  it("lo guardado se recupera al montar de nuevo", () => {
    sistemaOscuro(false);
    const primero = renderHook(() => useTema());
    act(() => primero.result.current[1]());
    primero.unmount();
    expect(renderHook(() => useTema()).result.current[0]).toBe("dark");
  });
});

describe("useAvisoNivel", () => {
  it("no avisa al montar, ni con el mismo nivel", () => {
    const { result, rerender } = renderHook((n) => useAvisoNivel(n), { initialProps: 3 });
    expect(result.current).toBe(false);
    rerender(3);
    expect(result.current).toBe(false);
  });
  it("avisa al subir y se apaga solo a los 1.8 s", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook((n) => useAvisoNivel(n), { initialProps: 1 });
    rerender(2);
    expect(result.current).toBe(true);
    act(() => { vi.advanceTimersByTime(DURACION_LEVEL_UP_MS - 1); });
    expect(result.current).toBe(true);
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe(false);
    expect(DURACION_LEVEL_UP_MS).toBe(1800);
  });
  it("bajar de nivel no avisa, y subir otra vez después sí", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook((n) => useAvisoNivel(n), { initialProps: 3 });
    rerender(2);
    expect(result.current).toBe(false);
    rerender(3);
    expect(result.current).toBe(true);
  });
});

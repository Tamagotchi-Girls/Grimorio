// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { createElement as h } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { ContenidoProvider } from "../data/ContenidoContext.jsx";
import { instalarAlmacenFalso } from "./almacenFalso.js";
import { useProgreso } from "./progreso.js";
import { useRuta } from "./ruta.js";
import { irAlInicio } from "./scroll.js";
import { useSimulacro } from "./useSimulacro.js";

const PE = CONTENIDO.PE.PREGUNTAS;
let pantalla;
let almacen;
beforeEach(() => {
  almacen = instalarAlmacenFalso();
  window.scrollTo = vi.fn();
  pantalla = document.createElement("main");
  pantalla.className = "pantalla";
  document.body.append(pantalla);
  pantalla.scrollTop = 500;
});
afterEach(() => { pantalla.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("irAlInicio", () => {
  it("regresa .pantalla (el contenedor con scroll) y la ventana al inicio", () => {
    irAlInicio();
    expect(pantalla.scrollTop).toBe(0);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
  it("sin .pantalla (pantalla previa sin ella) no truena", () => {
    pantalla.remove();
    expect(() => irAlInicio()).not.toThrow();
  });
});

describe("useRuta", () => {
  it("al cambiar la ruta regresa .pantalla al inicio y actualiza la ruta", () => {
    const { result } = renderHook(() => useRuta());
    location.hash = "/temas";
    act(() => { window.dispatchEvent(new HashChangeEvent("hashchange")); });
    expect(result.current.ruta).toBe("temas");
    expect(pantalla.scrollTop).toBe(0);
  });
});

describe("terminar el simulacro (useSimulacro + useProgreso reales)", () => {
  const montar = () => renderHook(() => {
    const prog = useProgreso();
    return { prog, sim: useSimulacro(prog) };
  }, { wrapper: ({ children }) => h(ContenidoProvider, { materia: "PE" }, children) });

  it("escribe el progreso UNA sola vez y guarda xp, reactivos y simulacro", () => {
    const { result } = montar();
    act(() => result.current.sim.empezar());
    for (let k = 0; k < 20; k++) { act(() => result.current.sim.irA(k)); act(() => result.current.sim.responder(0)); }
    const escrituras = almacen.setItem;
    escrituras.mockClear();
    act(() => result.current.sim.terminar());
    const deProgreso = escrituras.mock.calls.filter(([k]) => k === "guia-pe-progreso-v1");
    expect(deProgreso).toHaveLength(1);
    const guardado = JSON.parse(deProgreso[0][1]);
    expect(guardado.simulacros).toHaveLength(1);
    expect(Object.keys(guardado.preguntas)).toHaveLength(20);
    expect(guardado.xp).toBe(result.current.sim.resultado.aciertos * 10);
  });

  it("los resultados se ven desde arriba: .pantalla vuelve a scrollTop = 0", () => {
    const { result } = montar();
    act(() => result.current.sim.empezar());
    pantalla.scrollTop = 800;
    act(() => result.current.sim.terminar());
    expect(result.current.sim.fase).toBe("resultados");
    expect(pantalla.scrollTop).toBe(0);
  });

  it("no sube nada al empezar ni al navegar entre preguntas", () => {
    const { result } = montar();
    act(() => result.current.sim.empezar());
    pantalla.scrollTop = 300;
    act(() => result.current.sim.irA(5));
    expect(pantalla.scrollTop).toBe(300);
    expect(PE.length).toBeGreaterThan(0);
  });
});

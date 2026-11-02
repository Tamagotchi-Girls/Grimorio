// @vitest-environment jsdom
import { createElement as h } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContenidoProvider } from "../data/ContenidoContext.jsx";
import { CONTENIDO } from "../data/contenido.js";
import { useProgreso } from "./progreso.js";

const PE = CONTENIDO.PE.PREGUNTAS, FP = CONTENIDO.FP.PREGUNTAS;
const guardar = (clave, xp, ids = []) => localStorage.setItem(clave, JSON.stringify({
  xp, preguntas: Object.fromEntries(ids.map((id) => [id, { intentos: 1, aciertos: 1, ultimo: true }])), simulacros: [], diasEstudio: [],
}));
const conMateria = (materia) => ({ children }) => h(ContenidoProvider, { materia }, children);
const leer = (clave) => JSON.parse(localStorage.getItem(clave));

beforeEach(() => {
  localStorage.clear();
  guardar("guia-pe-progreso-v1", 250, [PE[0].id]);
  guardar("guia-fp-progreso-v1", 30, [FP[0].id, FP[1].id]);
});

describe("useProgreso", () => {
  it("lee el progreso de la materia del proveedor", () => {
    const { result } = renderHook(() => useProgreso(), { wrapper: conMateria("FP") });
    expect(result.current.datos.xp).toBe(30);
    expect(result.current.dominadas).toBe(2);
    expect(result.current.nivel).toBe(1);
  });

  it("al cambiar la materia SIN desmontar carga el progreso de la nueva y no mezcla ni pisa nada", () => {
    let materia = "PE";
    const wrapper = ({ children }) => h(ContenidoProvider, { materia }, children);
    const { result, rerender } = renderHook(() => useProgreso(), { wrapper });
    expect(result.current.datos.xp).toBe(250);
    materia = "FP"; rerender();
    expect(result.current.datos.xp).toBe(30);
    expect(result.current.dominadas).toBe(2);
    expect(leer("guia-pe-progreso-v1").xp).toBe(250); // el de PE sigue intacto
    expect(leer("guia-fp-progreso-v1").xp).toBe(30);
    act(() => result.current.registrar(FP[5].id, true));
    expect(leer("guia-fp-progreso-v1").xp).toBe(40);
    expect(leer("guia-pe-progreso-v1").xp).toBe(250);
    materia = "PE"; rerender();
    expect(result.current.datos.xp).toBe(250);
    expect(result.current.nivel).toBe(3);
  });

  it("registrar suma XP, anota el reactivo y guarda", () => {
    const { result } = renderHook(() => useProgreso(), { wrapper: conMateria("PE") });
    act(() => result.current.registrar(PE[1].id, true));
    expect(result.current.datos.xp).toBe(260);
    expect(result.current.datos.preguntas[PE[1].id]).toEqual({ intentos: 1, aciertos: 1, ultimo: true });
    expect(leer("guia-pe-progreso-v1").xp).toBe(260);
  });

  it("registrarVarias aplica toda la lista en una sola actualización (un solo guardado)", () => {
    const { result } = renderHook(() => useProgreso(), { wrapper: conMateria("PE") });
    const escrituras = vi.spyOn(Storage.prototype, "setItem");
    escrituras.mockClear();
    const lista = PE.slice(1, 21).map((p, k) => [p.id, k % 2 === 0]);
    act(() => result.current.registrarVarias(lista));
    expect(result.current.datos.xp).toBe(250 + 10 * 10);
    expect(Object.keys(result.current.datos.preguntas)).toHaveLength(21);
    expect(escrituras.mock.calls.filter(([k]) => k === "guia-pe-progreso-v1")).toHaveLength(1);
    escrituras.mockRestore();
  });

  it("terminar un simulacro (registrarVarias + guardarSimulacro) guarda xp, preguntas y el simulacro", () => {
    const { result } = renderHook(() => useProgreso(), { wrapper: conMateria("PE") });
    act(() => {
      result.current.registrarVarias([[PE[2].id, true], [PE[3].id, false]]);
      result.current.guardarSimulacro({ fecha: "2026-06-15T10:30:00.000Z", aciertos: 1, total: 2, calificacion: 50, porTema: {} });
    });
    const g = leer("guia-pe-progreso-v1");
    expect(g.xp).toBe(260);
    expect(g.simulacros).toHaveLength(1);
    expect(g.preguntas[PE[3].id].ultimo).toBe(false);
  });

  it("reiniciar deja vacío el progreso de esta materia solamente", () => {
    const { result } = renderHook(() => useProgreso(), { wrapper: conMateria("PE") });
    act(() => result.current.reiniciar());
    expect(result.current.datos.xp).toBe(0);
    expect(leer("guia-pe-progreso-v1").xp).toBe(0);
    expect(leer("guia-fp-progreso-v1").xp).toBe(30);
  });
});

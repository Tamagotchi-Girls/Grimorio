// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { createElement as h } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { ContenidoProvider } from "../data/ContenidoContext.jsx";
import { totalSimulacro } from "./conteos.js";
import { mensajeConfirmacion, useSimulacro } from "./useSimulacro.js";

const envoltorio = (materia) => ({ children }) => h(ContenidoProvider, { materia }, children);
const progFalso = () => ({ registrar: vi.fn(), registrarVarias: vi.fn(), guardarSimulacro: vi.fn() });
const montar = (materia = "PE") => {
  const prog = progFalso();
  const r = renderHook(() => useSimulacro(prog), { wrapper: envoltorio(materia) });
  return { prog, ...r };
};
const pulsar = (key) => act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true })); });
const correcta = (r) => r.opcionesBarajadas.findIndex((o) => o.correcta);

beforeEach(() => { window.scrollTo = vi.fn(); });

describe("mensajeConfirmacion", () => {
  it("faltan respuestas", () => {
    expect(mensajeConfirmacion(17, 20, 0)).toBe("Te faltan 3 preguntas sin responder. Cuentan como incorrectas. ¿Terminar y ver tu calificación?");
  });
  it("respondió todo y marcó algunas", () => {
    expect(mensajeConfirmacion(20, 20, 2)).toBe("Respondiste todo. Tienes 2 marcadas para revisar. ¿Terminar y ver tu calificación?");
  });
  it("respondió todo y no marcó nada", () => {
    expect(mensajeConfirmacion(20, 20, 0)).toBe("Respondiste todo. ¿Terminar y ver tu calificación?");
  });
});

describe("useSimulacro", () => {
  it("empieza en la introducción, sin reactivos", () => {
    const { result } = montar();
    expect(result.current.fase).toBe("intro");
    expect(result.current.reactivos).toEqual([]);
    expect(result.current.resultado).toBeNull();
  });

  it("empezar: pasa a jugando con el total de reactivos de la materia, en la primera", () => {
    for (const materia of ["PE", "FP"]) {
      const { result } = montar(materia);
      act(() => result.current.empezar());
      expect(result.current.fase).toBe("jugando");
      expect(result.current.reactivos).toHaveLength(totalSimulacro(CONTENIDO[materia].TEMAS));
      expect(result.current.i).toBe(0);
      const ids = new Set(CONTENIDO[materia].PREGUNTAS.map((p) => p.id));
      expect(result.current.reactivos.every((r) => ids.has(r.id))).toBe(true);
    }
  });

  it("responder y cambiar de respuesta; cuenta las contestadas", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    act(() => result.current.responder(2));
    expect(result.current.respuestas).toEqual({ 0: 2 });
    act(() => result.current.responder(1));
    expect(result.current.respuestas).toEqual({ 0: 1 });
    act(() => result.current.irA(3));
    act(() => result.current.responder(0));
    expect(result.current.contestadas).toBe(2);
  });

  it("marcar y desmarcar la pregunta actual", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    act(() => result.current.alternarMarca());
    expect(result.current.marcadas).toEqual({ 0: true });
    expect(result.current.totalMarcadas).toBe(1);
    act(() => result.current.alternarMarca());
    expect(result.current.totalMarcadas).toBe(0);
  });

  it("irA respeta los límites", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    const n = result.current.reactivos.length;
    act(() => result.current.irA(-1)); expect(result.current.i).toBe(0);
    act(() => result.current.irA(n)); expect(result.current.i).toBe(0);
    act(() => result.current.irA(n - 1)); expect(result.current.i).toBe(n - 1);
    expect(result.current.ultima).toBe(true);
  });

  it("teclas: un número responde, las flechas navegan sin salirse, Enter no hace nada", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    pulsar("2");
    expect(result.current.respuestas).toEqual({ 0: 1 });
    pulsar("ArrowLeft"); expect(result.current.i).toBe(0);
    pulsar("ArrowRight"); pulsar("ArrowRight"); expect(result.current.i).toBe(2);
    pulsar("ArrowLeft"); expect(result.current.i).toBe(1);
    pulsar("Enter"); expect(result.current.i).toBe(1);
    act(() => result.current.irA(result.current.reactivos.length - 1));
    pulsar("ArrowRight"); expect(result.current.i).toBe(result.current.reactivos.length - 1);
  });

  it("las teclas solo valen mientras se juega", () => {
    const { result } = montar();
    pulsar("1");
    expect(result.current.respuestas).toEqual({});
    act(() => result.current.empezar());
    act(() => result.current.terminar());
    pulsar("1");
    expect(result.current.respuestas).toEqual({});
  });

  it("confirmar y cancelar", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    act(() => result.current.pedirConfirmar());
    expect(result.current.confirmando).toBe(true);
    act(() => result.current.cancelarConfirmar());
    expect(result.current.confirmando).toBe(false);
    expect(result.current.fase).toBe("jugando");
  });

  it("terminar hace UNA sola llamada para registrar todo (no una por reactivo) y guarda el simulacro una vez", () => {
    const { result, prog } = montar();
    act(() => result.current.empezar());
    for (let k = 0; k < 20; k++) { act(() => result.current.irA(k)); act(() => result.current.responder(0)); }
    act(() => result.current.terminar());
    expect(prog.registrarVarias).toHaveBeenCalledTimes(1);
    expect(prog.registrarVarias.mock.calls[0][0]).toHaveLength(20);
    expect(prog.registrar).not.toHaveBeenCalled();
    expect(prog.guardarSimulacro).toHaveBeenCalledTimes(1);
  });

  it("terminar: registra solo las respondidas, calcula el resultado y pasa a resultados", () => {
    const { result, prog } = montar();
    act(() => result.current.empezar());
    const reactivos = result.current.reactivos;
    act(() => result.current.responder(correcta(reactivos[0])));            // 0: bien
    act(() => result.current.irA(1));
    act(() => result.current.responder((correcta(reactivos[1]) + 1) % 4));  // 1: mal
    act(() => result.current.terminar());

    expect(prog.registrarVarias.mock.calls[0][0]).toEqual([[reactivos[0].id, true], [reactivos[1].id, false]]);
    const res = prog.guardarSimulacro.mock.calls[0][0];
    expect(Object.keys(res)).toEqual(["fecha", "aciertos", "total", "calificacion", "porTema"]);
    expect(res).toMatchObject({ aciertos: 1, total: reactivos.length, calificacion: Math.round(100 / reactivos.length) });
    expect(Number.isNaN(Date.parse(res.fecha))).toBe(false);
    expect(result.current.fase).toBe("resultados");
    expect(result.current.resultado).toBe(res);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("la fase se deriva del resultado; 'Hacer otro' vuelve a jugar con todo limpio", () => {
    const { result } = montar();
    act(() => result.current.empezar());
    act(() => result.current.responder(1));
    act(() => result.current.alternarMarca());
    expect(result.current.fase).toBe("jugando");
    act(() => result.current.terminar());
    expect(result.current.fase).toBe("resultados");
    act(() => result.current.empezar());
    expect(result.current.fase).toBe("jugando");
    expect(result.current.resultado).toBeNull();
    expect(result.current.respuestas).toEqual({});
    expect(result.current.marcadas).toEqual({});
    expect(result.current.i).toBe(0);
    expect(result.current.confirmando).toBe(false);
  });
});

// @vitest-environment happy-dom
import { createElement as h } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContenidoProvider } from "../data/ContenidoContext.jsx";
import { CONTENIDO } from "../data/contenido.js";
import { estadosDeRonda, mensajeResultado, secuenciaDeRespuesta, usePractica } from "./usePractica.js";

const envoltorio = (materia) => ({ children }) => h(ContenidoProvider, { materia }, children);
const montar = (materia = "PE", temaId = 1) => {
  const prog = { registrar: vi.fn() };
  const tema = CONTENIDO[materia].TEMAS.find((t) => t.id === temaId);
  const r = renderHook(() => usePractica(tema, prog), { wrapper: envoltorio(materia) });
  return { prog, ...r };
};
const correcta = (r) => r.opcionesBarajadas.findIndex((o) => o.correcta);
const mala = (r) => (correcta(r) + 1) % r.opcionesBarajadas.length;

describe("mensajeResultado / secuenciaDeRespuesta / estadosDeRonda", () => {
  it("un texto por medalla", () => {
    expect(mensajeResultado("copa")).toBe("¡Tema dominado! Cada respuesta fue correcta.");
    expect(mensajeResultado("estrella")).toBe("¡Muy bien! Revisa los apuntes de lo que fallaste y vuelve a intentarlo.");
    expect(mensajeResultado("corazon")).toBe("Lee otra vez los apuntes con calma. La segunda vuelta siempre sale mejor.");
  });
  const r = { opcionesBarajadas: [{ correcta: false }, { correcta: true }] };
  it("secuencia del hada", () => {
    expect(secuenciaDeRespuesta(r, undefined)).toBe("reposo");
    expect(secuenciaDeRespuesta(undefined, undefined)).toBe("reposo");
    expect(secuenciaDeRespuesta(r, 1)).toBe("acierto");
    expect(secuenciaDeRespuesta(r, 0)).toBe("fallo");
  });
  it("estados de la ronda: ok, mal, el actual y los pendientes", () => {
    expect(estadosDeRonda([r, r, r, r], { 0: 1, 1: 0 }, 2)).toEqual(["ok", "mal", "actual", "nada"]);
  });
});

describe("usePractica", () => {
  it("trae los reactivos del tema, con las opciones barajadas, empezando en el primero", () => {
    const { result } = montar("FP", 2);
    const ids = CONTENIDO.FP.PREGUNTAS.filter((p) => p.tema === 2).map((p) => p.id).sort();
    expect(result.current.reactivos.map((r) => r.id).sort()).toEqual(ids);
    expect(result.current.i).toBe(0);
    expect(result.current.respondida).toBe(false);
    expect(result.current.terminado).toBe(false);
  });

  it("elegir registra la respuesta en el progreso una sola vez y no deja cambiarla", () => {
    const { result, prog } = montar();
    const r0 = result.current.reactivos[0];
    act(() => result.current.elegir(correcta(r0)));
    expect(prog.registrar).toHaveBeenCalledTimes(1);
    expect(prog.registrar).toHaveBeenCalledWith(r0.id, true);
    expect(result.current.respondida).toBe(true);
    act(() => result.current.elegir(mala(r0)));
    expect(prog.registrar).toHaveBeenCalledTimes(1);
    expect(result.current.seleccion).toBe(correcta(r0));
  });

  it("recorre el tema, cuenta aciertos y termina con medalla", () => {
    const { result, prog } = montar();
    const n = result.current.reactivos.length;
    for (let k = 0; k < n; k++) {
      const r = result.current.actual;
      act(() => result.current.elegir(k === 0 ? mala(r) : correcta(r)));
      expect(result.current.ultima).toBe(k === n - 1);
      act(() => result.current.siguiente());
    }
    expect(result.current.terminado).toBe(true);
    expect(result.current.aciertos).toBe(n - 1);
    expect(prog.registrar).toHaveBeenCalledTimes(n);
    expect(result.current.medalla).toBe("estrella"); // 5 de 6
  });

  it("todo bien da la copa", () => {
    const { result } = montar();
    const n = result.current.reactivos.length;
    for (let k = 0; k < n; k++) { act(() => result.current.elegir(correcta(result.current.actual))); act(() => result.current.siguiente()); }
    expect(result.current.aciertos).toBe(n);
    expect(result.current.medalla).toBe("copa");
  });

  it("repetir vuelve a empezar, sin respuestas, con otra ronda", () => {
    const { result } = montar();
    act(() => result.current.elegir(0));
    act(() => result.current.siguiente());
    const antes = result.current.ronda;
    act(() => result.current.repetir());
    expect(result.current.ronda).toBe(antes + 1);
    expect(result.current.i).toBe(0);
    expect(result.current.respuestas).toEqual({});
    expect(result.current.terminado).toBe(false);
  });
});

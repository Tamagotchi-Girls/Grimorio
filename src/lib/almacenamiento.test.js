import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLAVES,
  claveProgreso,
  escribirJSON,
  escribirTexto,
  huboFalloAlGuardar,
  leerJSON,
  leerTexto,
  quitar,
  suscribirFallos,
} from "./almacenamiento.js";

// localStorage mínimo en memoria; `falla` simula cuota llena y `bloqueado` el modo privado estricto.
function instalarAlmacen() {
  const datos = new Map();
  const almacen = {
    falla: false,
    bloqueado: false,
    getItem(k) { if (this.bloqueado) throw new Error("SecurityError"); return datos.has(k) ? datos.get(k) : null; },
    setItem(k, v) { if (this.falla || this.bloqueado) throw new Error("QuotaExceededError"); datos.set(k, String(v)); },
    removeItem(k) { if (this.bloqueado) throw new Error("SecurityError"); datos.delete(k); },
  };
  vi.stubGlobal("localStorage", almacen);
  return almacen;
}

describe("claves", () => {
  it("conservan los valores que ya están guardados en los dispositivos", () => {
    expect(CLAVES).toEqual({
      perfil: "grimorio-perfil-v1",
      materiaActiva: "grimorio-materia-activa",
      tema: "guia-pe-tema",
    });
    expect(claveProgreso("PE")).toBe("guia-pe-progreso-v1");
    expect(claveProgreso("FP")).toBe("guia-fp-progreso-v1");
  });
});

describe("almacenamiento", () => {
  let almacen;
  beforeEach(() => { almacen = instalarAlmacen(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("guarda y lee texto y JSON", () => {
    expect(escribirTexto("a", "hola")).toBe(true);
    expect(leerTexto("a")).toBe("hola");
    expect(escribirJSON("b", { x: 1 })).toBe(true);
    expect(leerJSON("b")).toEqual({ x: 1 });
    quitar("a");
    expect(leerTexto("a")).toBeNull();
  });

  it("JSON roto o ausente devuelve el valor por defecto", () => {
    almacen.setItem("roto", "{no es json");
    expect(leerJSON("roto", "defecto")).toBe("defecto");
    expect(leerJSON("no-existe")).toBeNull();
    expect(leerJSON("no-existe", {})).toEqual({});
  });

  it("si localStorage lanza al leer o quitar, no truena", () => {
    almacen.bloqueado = true;
    expect(leerTexto("a")).toBeNull();
    expect(leerJSON("a", 5)).toBe(5);
    expect(() => quitar("a")).not.toThrow();
  });

  it("un fallo al guardar devuelve false, se registra y avisa una sola vez", () => {
    const oyente = vi.fn();
    const baja = suscribirFallos(oyente);
    almacen.falla = true;
    expect(escribirTexto("a", "1")).toBe(false);
    expect(escribirJSON("b", {})).toBe(false);
    expect(huboFalloAlGuardar()).toBe(true);
    expect(oyente).toHaveBeenCalledTimes(1);
    almacen.falla = false;
    expect(escribirTexto("a", "1")).toBe(true);
    expect(huboFalloAlGuardar()).toBe(false);
    expect(oyente).toHaveBeenCalledTimes(2);
    baja();
  });

  it("un valor que no se puede serializar cuenta como fallo al guardar", () => {
    const circular = {}; circular.yo = circular;
    expect(escribirJSON("c", circular)).toBe(false);
    expect(huboFalloAlGuardar()).toBe(true);
    expect(escribirTexto("a", "1")).toBe(true);
  });
});

import fs from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProgreso } from "../lib/progreso.js";
import { CONTENIDO, contenidoDe } from "./contenido.js";
import { ContenidoProvider, useContenido } from "./ContenidoContext.jsx";

describe("contenidoDe", () => {
  it("devuelve la materia con sus temas y reactivos", () => {
    for (const id of ["PE", "FP"]) {
      const c = contenidoDe(id);
      expect(c.materia).toBe(id);
      expect(c.TEMAS).toBe(CONTENIDO[id].TEMAS);
      expect(c.PREGUNTAS).toBe(CONTENIDO[id].PREGUNTAS);
    }
  });
  it("PE y FP no comparten reactivos", () => {
    const pe = new Set(contenidoDe("PE").PREGUNTAS.map((p) => p.id));
    expect(contenidoDe("FP").PREGUNTAS.some((p) => pe.has(p.id))).toBe(false);
  });
  it("una clave desconocida (o heredada del prototipo) cae en PE", () => {
    for (const x of ["XX", null, undefined, "constructor", "toString"]) expect(contenidoDe(x).materia).toBe("PE");
  });
  it("CONTENIDO es constante: no se puede reasignar ni añadir materias", () => {
    expect(Object.isFrozen(CONTENIDO)).toBe(true);
    expect(Object.isFrozen(CONTENIDO.PE)).toBe(true);
  });
});

const Lector = () => {
  const { materia, TEMAS, PREGUNTAS } = useContenido();
  return h("p", null, `${materia}:${TEMAS.length}:${PREGUNTAS.length}:${PREGUNTAS[0].id}`);
};
const con = (materia, ...hijos) => h(ContenidoProvider, { materia }, ...hijos);
const html = (el) => renderToStaticMarkup(el);

describe("ContenidoProvider / useContenido", () => {
  it("cada proveedor da el contenido de su materia", () => {
    expect(html(con("PE", h(Lector)))).toBe(`<p>PE:${CONTENIDO.PE.TEMAS.length}:${CONTENIDO.PE.PREGUNTAS.length}:${CONTENIDO.PE.PREGUNTAS[0].id}</p>`);
    expect(html(con("FP", h(Lector)))).toBe(`<p>FP:${CONTENIDO.FP.TEMAS.length}:${CONTENIDO.FP.PREGUNTAS.length}:${CONTENIDO.FP.PREGUNTAS[0].id}</p>`);
  });
  it("sin estado global: dos materias en el mismo árbol no se mezclan, en cualquier orden", () => {
    const s = html(h("div", null, con("PE", h(Lector)), con("FP", h(Lector)), con("PE", h(Lector))));
    expect(s.match(/<p>(PE|FP):/g)).toEqual(["<p>PE:", "<p>FP:", "<p>PE:"]);
    expect(html(con("PE", h(Lector)))).toContain("PE:"); // y después de haber dibujado FP sigue siendo PE
  });
  it("el más interno gana", () => {
    expect(html(con("PE", con("FP", h(Lector))))).toContain("<p>FP:");
  });
  it("fuera de un proveedor falla con un mensaje claro", () => {
    expect(() => html(h(Lector))).toThrow(/ContenidoProvider/);
  });
});

describe("useProgreso lee el progreso de la materia del proveedor", () => {
  afterEach(() => vi.unstubAllGlobals());
  const Resumen = () => { const p = useProgreso(); return h("p", null, `${p.datos.xp}:${p.dominadas}:${p.nivel}`); };
  it("PE y FP con progresos distintos", () => {
    const pe = CONTENIDO.PE.PREGUNTAS, fp = CONTENIDO.FP.PREGUNTAS;
    const almacen = {
      "guia-pe-progreso-v1": JSON.stringify({ xp: 250, preguntas: { [pe[0].id]: { intentos: 1, aciertos: 1, ultimo: true } }, simulacros: [], diasEstudio: [] }),
      "guia-fp-progreso-v1": JSON.stringify({ xp: 30, preguntas: { [fp[0].id]: { intentos: 1, aciertos: 1, ultimo: true }, [fp[1].id]: { intentos: 1, aciertos: 1, ultimo: true } }, simulacros: [], diasEstudio: [] }),
    };
    vi.stubGlobal("localStorage", { getItem: (k) => almacen[k] ?? null, setItem() {} });
    expect(html(con("PE", h(Resumen)))).toBe("<p>250:1:3</p>");
    expect(html(con("FP", h(Resumen)))).toBe("<p>30:2:1</p>");
  });
});

// Regresión de A1: el contenido de la materia no puede volver a ser estado global que se reasigna.
describe("data/ no tiene estado global mutable", () => {
  const raiz = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const archivos = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivos(path.join(dir, e.name)) : /\.(js|jsx)$/.test(e.name) && !e.name.endsWith(".test.js") ? [path.join(dir, e.name)] : []);
  it("ningún archivo de src/data escribe `export let` ni `export var`", () => {
    const lista = archivos(raiz);
    expect(lista.length).toBeGreaterThan(4);
    const malos = lista.filter((f) => /^\s*export\s+(let|var)\b/m.test(fs.readFileSync(f, "utf8")));
    expect(malos).toEqual([]);
  });
  it("tampoco queda `usarMateria`", () => {
    expect(archivos(path.resolve(raiz, "..")).filter((f) => /\busarMateria\b/.test(fs.readFileSync(f, "utf8")))).toEqual([]);
  });
});

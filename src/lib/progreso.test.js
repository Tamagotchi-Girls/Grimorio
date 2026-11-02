import { afterEach, describe, expect, it, vi } from "vitest";
import { barajar, prepararReactivo, resumenMateria, resumenTema } from "./progreso.js";
import { CONTENIDO } from "../data/contenido.js";

describe("barajar", () => {
  it("devuelve una permutación sin tocar el original", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const copia = [...original];
    const resultado = barajar(original);
    expect(original).toEqual(copia);
    expect([...resultado].sort((a, b) => a - b)).toEqual(copia);
  });
});

describe("prepararReactivo", () => {
  it("conserva las 4 opciones y exactamente una correcta, la misma que el original", () => {
    for (const { PREGUNTAS } of Object.values(CONTENIDO)) {
      for (const p of PREGUNTAS) {
        const r = prepararReactivo(p);
        expect(r.opcionesBarajadas.map((o) => o.texto).sort()).toEqual([...p.opciones].sort());
        const correctas = r.opcionesBarajadas.filter((o) => o.correcta);
        expect(correctas, p.id).toHaveLength(1);
        expect(correctas[0].texto, p.id).toBe(p.opciones[p.correcta]);
      }
    }
  });
});


// Progreso de prueba: marca como "ok" (bien la última vez) o "mal" los ids indicados.
const progresoCon = (ok = [], mal = [], xp = 0) => ({
  xp,
  preguntas: {
    ...Object.fromEntries(ok.map((id) => [id, { intentos: 1, aciertos: 1, ultimo: true }])),
    ...Object.fromEntries(mal.map((id) => [id, { intentos: 1, aciertos: 0, ultimo: false }])),
  },
  simulacros: [],
  diasEstudio: [],
});
const idsDelTema = (materia, tema) => CONTENIDO[materia].PREGUNTAS.filter((p) => p.tema === tema).map((p) => p.id);

describe("resumenTema", () => {
  const { PREGUNTAS } = CONTENIDO.PE;

  it("cuenta los reactivos bien, el total del tema y si está completo", () => {
    const ids = idsDelTema("PE", 1);
    expect(ids).toHaveLength(6);
    expect(resumenTema(progresoCon(), PREGUNTAS, 1)).toEqual({ ok: 0, total: 6, completo: false });
    expect(resumenTema(progresoCon(ids.slice(0, 2), ids.slice(2, 4)), PREGUNTAS, 1)).toEqual({ ok: 2, total: 6, completo: false });
    expect(resumenTema(progresoCon(ids), PREGUNTAS, 1)).toEqual({ ok: 6, total: 6, completo: true });
  });

  it("un reactivo fallado la última vez no cuenta, aunque antes se haya acertado", () => {
    const ids = idsDelTema("PE", 2);
    const datos = progresoCon(ids.slice(1), ids.slice(0, 1));
    datos.preguntas[ids[0]].aciertos = 5; // acertó 5 veces, pero falló la última
    expect(resumenTema(datos, PREGUNTAS, 2)).toEqual({ ok: 5, total: 6, completo: false });
  });

  it("solo mira los reactivos de ese tema y de la lista que se le da", () => {
    const datos = progresoCon(idsDelTema("PE", 3));
    expect(resumenTema(datos, PREGUNTAS, 4).ok).toBe(0);
    expect(resumenTema(datos, CONTENIDO.FP.PREGUNTAS, 3)).toEqual({ ok: 0, total: 6, completo: false });
  });

  it("coincide con la cuenta que hacían las vistas (estadoTema === 'ok')", () => {
    const todos = PREGUNTAS.map((p) => p.id);
    const datos = progresoCon(todos.filter((_, i) => i % 3 === 0), todos.filter((_, i) => i % 3 === 1));
    for (let t = 1; t <= 10; t++) {
      const estados = PREGUNTAS.filter((p) => p.tema === t).map((p) => (!datos.preguntas[p.id] ? "nada" : datos.preguntas[p.id].ultimo ? "ok" : "mal"));
      const r = resumenTema(datos, PREGUNTAS, t);
      expect(r.ok, `tema ${t}`).toBe(estados.filter((e) => e === "ok").length);
      expect(r.total).toBe(estados.length);
      expect(r.completo).toBe(estados.every((e) => e === "ok"));
    }
  });

  it("un tema sin reactivos queda 0/0 y completo, como antes (ok === total)", () => {
    expect(resumenTema(progresoCon(), PREGUNTAS, 99)).toEqual({ ok: 0, total: 0, completo: true });
  });
});

describe("resumenMateria", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("nivel por XP y dominio como porcentaje redondeado de reactivos dominados", () => {
    const ids = CONTENIDO.PE.PREGUNTAS.map((p) => p.id);
    expect(resumenMateria("PE", progresoCon(ids.slice(0, 20), ids.slice(20, 30), 235))).toEqual({ nivel: 3, dominadas: 20, total: 60, dominio: 33 });
    expect(resumenMateria("PE", progresoCon(ids.slice(0, 40)))).toMatchObject({ dominadas: 40, dominio: 67 });
    expect(resumenMateria("PE", progresoCon(ids))).toMatchObject({ dominadas: 60, dominio: 100, nivel: 1 });
  });

  it("sin progreso: nivel 1 y 0 %", () => {
    expect(resumenMateria("PE", progresoCon())).toEqual({ nivel: 1, dominadas: 0, total: 60, dominio: 0 });
  });

  it("cada materia cuenta solo sus propios reactivos", () => {
    const idsFP = CONTENIDO.FP.PREGUNTAS.map((p) => p.id);
    const datos = progresoCon(idsFP.slice(0, 6));
    expect(resumenMateria("PE", datos).dominadas).toBe(0);
    expect(resumenMateria("FP", datos)).toMatchObject({ dominadas: 6, dominio: 10 });
  });

  it("una materia desconocida no truena", () => {
    expect(resumenMateria("XX", progresoCon([], [], 150))).toEqual({ nivel: 2, dominadas: 0, total: 0, dominio: 0 });
  });

  it("sin `datos` lee de almacenamiento.js: progreso guardado, vacío o corrupto", () => {
    const idsFP = CONTENIDO.FP.PREGUNTAS.map((p) => p.id);
    const guardado = { "guia-fp-progreso-v1": JSON.stringify(progresoCon(idsFP.slice(0, 30), [], 420)), "guia-pe-progreso-v1": "{roto" };
    vi.stubGlobal("localStorage", { getItem: (k) => guardado[k] ?? null, setItem() {}, removeItem() {} });
    expect(resumenMateria("FP")).toEqual({ nivel: 5, dominadas: 30, total: 60, dominio: 50 });
    expect(resumenMateria("PE")).toEqual({ nivel: 1, dominadas: 0, total: 60, dominio: 0 });
  });
});

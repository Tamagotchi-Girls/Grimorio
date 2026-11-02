import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { claveProgreso } from "./almacenamiento.js";
import { leerProgreso } from "./progreso.js";
import {
  LIMITES,
  combinarProgreso,
  normalizarPerfil,
  normalizarProgreso,
  normalizarTransferencia,
  progresoVacio,
} from "./validacion.js";

const AHORA = new Date("2026-06-15T10:30:00Z");
const idPE = CONTENIDO.PE.PREGUNTAS[0].id;
const idPE2 = CONTENIDO.PE.PREGUNTAS[1].id;
const idFP = CONTENIDO.FP.PREGUNTAS[0].id;
const sim = (calificacion = 80, extra = {}) => ({ fecha: "2026-06-14T19:05:00.000Z", aciertos: 16, total: 20, calificacion, porTema: {}, ...extra });
const progreso = (extra) => normalizarProgreso({ ...progresoVacio(), ...extra }, "PE", AHORA);

describe("normalizarProgreso · datos que no son un objeto", () => {
  it.each([null, undefined, "texto", 42, true, []])("%j → progreso vacío", (entrada) => {
    expect(normalizarProgreso(entrada, "PE", AHORA)).toEqual(progresoVacio());
  });

  it("devuelve objetos nuevos cada vez (no comparte estado mutable)", () => {
    const a = normalizarProgreso(null);
    a.preguntas.x = 1; a.simulacros.push(1);
    expect(normalizarProgreso(null)).toEqual(progresoVacio());
  });
});

describe("normalizarProgreso · xp", () => {
  it("texto numérico se convierte; texto no numérico, negativo y no finito pasan a 0", () => {
    expect(progreso({ xp: "150" }).xp).toBe(150);
    expect(progreso({ xp: " 40.9 " }).xp).toBe(40);
    for (const malo of ["abc", "", "-5", -5, NaN, Infinity, null, undefined, {}, [], true, "1e3", "0x10"]) {
      expect(progreso({ xp: malo }).xp, String(malo)).toBe(0);
    }
  });

  it("los decimales se truncan y hay un tope razonable", () => {
    expect(progreso({ xp: 235.8 }).xp).toBe(235);
    expect(progreso({ xp: 1e12 }).xp).toBe(LIMITES.xp);
    expect(progreso({ xp: "99999999999" }).xp).toBe(LIMITES.xp);
  });
});

describe("normalizarProgreso · preguntas", () => {
  it("un arreglo (o cualquier cosa que no sea objeto) se descarta", () => {
    expect(progreso({ preguntas: [{ intentos: 1, aciertos: 1 }] }).preguntas).toEqual({});
    expect(progreso({ preguntas: "x" }).preguntas).toEqual({});
    expect(progreso({ preguntas: null }).preguntas).toEqual({});
  });

  it("solo quedan ids que existen en esa materia", () => {
    const bueno = { intentos: 2, aciertos: 1, ultimo: true };
    // JSON.parse crea `__proto__` como clave propia (un literal de objeto no lo haría)
    const venido = JSON.parse(JSON.stringify({ [idPE]: bueno, inventado: bueno, [idFP]: bueno, constructor: bueno }).replace("{", `{"__proto__":{"intentos":9,"aciertos":9,"polucion":true},`));
    expect(Object.keys(venido)).toContain("__proto__");
    const r = progreso({ preguntas: venido });
    expect(Object.keys(r.preguntas)).toEqual([idPE]);
    expect(Object.getPrototypeOf(r.preguntas)).toBe(Object.prototype);
    expect({}.polucion).toBeUndefined();
    expect(normalizarProgreso({ preguntas: { [idFP]: bueno } }, "FP").preguntas).toHaveProperty(idFP);
    expect(normalizarProgreso({ preguntas: { [idPE]: bueno } }, "FP").preguntas).toEqual({});
  });

  it("descarta entradas con intentos/aciertos inválidos y acota aciertos a intentos", () => {
    const r = progreso({
      preguntas: {
        [idPE]: { intentos: 3, aciertos: 9, ultimo: true }, // aciertos > intentos → se acota
        [idPE2]: { intentos: "x", aciertos: 1 },
        [CONTENIDO.PE.PREGUNTAS[2].id]: { intentos: -1, aciertos: 0 },
        [CONTENIDO.PE.PREGUNTAS[3].id]: { intentos: 2.5, aciertos: 1 },
        [CONTENIDO.PE.PREGUNTAS[4].id]: { intentos: 0, aciertos: 0 },
        [CONTENIDO.PE.PREGUNTAS[5].id]: "no soy objeto",
        [CONTENIDO.PE.PREGUNTAS[6].id]: null,
      },
    });
    expect(r.preguntas).toEqual({ [idPE]: { intentos: 3, aciertos: 3, ultimo: true } });
  });

  it("acepta números como texto y no deja `ultimo` en true si nunca se acertó", () => {
    const r = progreso({ preguntas: { [idPE]: { intentos: "4", aciertos: "0", ultimo: true }, [idPE2]: { intentos: 1, aciertos: 1, ultimo: "sí" } } });
    expect(r.preguntas[idPE]).toEqual({ intentos: 4, aciertos: 0, ultimo: false });
    expect(r.preguntas[idPE2].ultimo).toBe(false);
  });
});

describe("normalizarProgreso · simulacros", () => {
  it("conserva como máximo los 10 últimos", () => {
    const muchos = Array.from({ length: 15 }, (_, i) => sim(i * 5));
    const r = progreso({ simulacros: muchos });
    expect(r.simulacros).toHaveLength(10);
    expect(r.simulacros.map((s) => s.calificacion)).toEqual(muchos.slice(-10).map((s) => s.calificacion));
  });

  it("descarta calificaciones fuera de 0–100 o que no son números, y fechas rotas", () => {
    const r = progreso({
      simulacros: [sim(150), sim(-1), sim("abc"), sim(null), sim(80, { fecha: "ayer" }), sim(80, { fecha: 5 }), sim(80, { aciertos: 30 }), sim(80, { total: 0 }), "x", null, sim(72.4)],
    });
    expect(r.simulacros).toHaveLength(1);
    expect(r.simulacros[0].calificacion).toBe(72);
  });

  it("un valor que no es arreglo se descarta; porTema inválido queda vacío", () => {
    expect(progreso({ simulacros: { 0: sim() } }).simulacros).toEqual([]);
    const r = progreso({ simulacros: [sim(60, { porTema: { 1: { ok: 2, total: 4 }, x: { ok: 1, total: 1 }, 2: { ok: 5, total: 1 }, 3: "no" } })] });
    expect(r.simulacros[0].porTema).toEqual({ 1: { ok: 2, total: 4 } });
  });
});

describe("normalizarProgreso · diasEstudio", () => {
  it("conserva como máximo 90 días, los más recientes, ordenados y sin repetir", () => {
    const base = Date.UTC(2026, 0, 1);
    const dias = Array.from({ length: 120 }, (_, i) => new Date(base + i * 86_400_000).toISOString().slice(0, 10));
    const r = progreso({ diasEstudio: [...dias].reverse().concat(dias[0], dias[1]) });
    expect(r.diasEstudio).toHaveLength(90);
    expect(r.diasEstudio.at(-1)).toBe(dias.at(-1));
    expect(r.diasEstudio).toEqual([...r.diasEstudio].sort());
    expect(new Set(r.diasEstudio).size).toBe(90);
  });

  it("descarta fechas que no existen, con otro formato, que no son texto o que están en el futuro", () => {
    const r = progreso({ diasEstudio: ["2026-02-30", "2026-13-01", "mañana", "2026-6-1", "2026-06-01T10:00:00Z", 20260601, null, "2026-06-14", "2026-06-16", "2027-01-01", "2026-06-13"] });
    expect(r.diasEstudio).toEqual(["2026-06-13", "2026-06-14", "2026-06-16"]); // el 16 es mañana UTC: se tolera por la zona horaria
  });

  it("un valor que no es arreglo se descarta", () => {
    expect(progreso({ diasEstudio: "2026-06-14" }).diasEstudio).toEqual([]);
  });
});

describe("normalizarProgreso · datos sanos", () => {
  it("no cambia nada (ni el orden de las claves, que afecta al enlace) y es idempotente", () => {
    const sano = {
      xp: 235,
      preguntas: { [idPE]: { intentos: 2, aciertos: 2, ultimo: true }, [idPE2]: { intentos: 2, aciertos: 1, ultimo: false } },
      simulacros: [sim(60, { fecha: "2026-06-13T18:20:00.000Z", aciertos: 12 }), sim(85, { aciertos: 17 })],
      diasEstudio: ["2026-06-13", "2026-06-14", "2026-06-15"],
    };
    const r = normalizarProgreso(sano, "PE", AHORA);
    expect(JSON.stringify(r)).toBe(JSON.stringify(sano));
    expect(normalizarProgreso(r, "PE", AHORA)).toEqual(r);
  });
});

describe("normalizarProgreso · JSON roto en localStorage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("leerProgreso devuelve progreso vacío si el JSON guardado está roto o es de otro tipo", () => {
    for (const guardado of ["{no es json", "[1,2,3]", "\"texto\"", "null", "12", ""]) {
      vi.stubGlobal("localStorage", { getItem: (k) => (k === claveProgreso("PE") ? guardado : null), setItem() {}, removeItem() {} });
      expect(leerProgreso("PE"), guardado).toEqual(progresoVacio());
    }
  });

  it("y se queda con lo rescatable si el objeto está a medias", () => {
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify({ xp: "70", preguntas: [], simulacros: 3 }), setItem() {}, removeItem() {} });
    expect(leerProgreso("PE")).toEqual({ xp: 70, preguntas: {}, simulacros: [], diasEstudio: [] });
  });
});

describe("normalizarPerfil", () => {
  it("un nombre de 10 000 caracteres se recorta a 32", () => {
    const p = normalizarPerfil({ nombre: "a".repeat(10_000), avatar: "nova" });
    expect(p.nombre).toHaveLength(32);
  });

  it("recorta por caracteres, no parte emojis a la mitad, y quita espacios sobrantes y control", () => {
    expect(Array.from(normalizarPerfil({ nombre: "😀".repeat(40) }).nombre)).toHaveLength(32);
    expect(normalizarPerfil({ nombre: "  Dani\n\u0000ela\t " }).nombre).toBe("Daniela");
  });

  it("un avatar inventado o ausente cae en riley; uno válido se conserva", () => {
    expect(normalizarPerfil({ nombre: "D", avatar: "dragon" }).avatar).toBe("riley");
    expect(normalizarPerfil({ nombre: "D", avatar: { id: "nova" } }).avatar).toBe("riley");
    expect(normalizarPerfil({ nombre: "D" }).avatar).toBe("riley");
    expect(normalizarPerfil({ nombre: "D", avatar: "onyx" }).avatar).toBe("onyx");
  });

  it("ignora el campo duplicado `hada` y no lo devuelve", () => {
    const p = normalizarPerfil({ nombre: "D", avatar: "lyra", hada: "nova" });
    expect(p).toEqual({ nombre: "D", avatar: "lyra" });
    expect(normalizarPerfil({ nombre: "D", hada: "nova" }).avatar).toBe("riley");
    expect("hada" in p).toBe(false);
  });

  it("sin nombre utilizable → null (la app vuelve a pedirlo)", () => {
    for (const malo of [null, undefined, "texto", 7, [], {}, { nombre: "" }, { nombre: "   " }, { nombre: 5 }, { nombre: ["a"] }, { nombre: "\n\t" }]) {
      expect(normalizarPerfil(malo), JSON.stringify(malo)).toBeNull();
    }
  });
});

describe("combinarProgreso", () => {
  it("toma el XP mayor, une preguntas (gana el entrante), simulacros y días", () => {
    const local = progreso({ xp: 100, preguntas: { [idPE]: { intentos: 1, aciertos: 0, ultimo: false } }, simulacros: [sim(50)], diasEstudio: ["2026-06-10", "2026-06-14"] });
    const entrante = progreso({ xp: 40, preguntas: { [idPE]: { intentos: 3, aciertos: 3, ultimo: true }, [idPE2]: { intentos: 1, aciertos: 1, ultimo: true } }, simulacros: [sim(90)], diasEstudio: ["2026-06-14", "2026-06-12"] });
    const r = combinarProgreso(local, entrante, "PE");
    expect(r.xp).toBe(100);
    expect(r.preguntas[idPE]).toEqual({ intentos: 3, aciertos: 3, ultimo: true });
    expect(Object.keys(r.preguntas)).toHaveLength(2);
    expect(r.simulacros.map((s) => s.calificacion)).toEqual([50, 90]);
    expect(r.diasEstudio).toEqual(["2026-06-10", "2026-06-12", "2026-06-14"]);
  });

  it("respeta los topes (10 simulacros, 90 días)", () => {
    const muchos = progreso({ simulacros: Array.from({ length: 10 }, () => sim()) });
    expect(combinarProgreso(muchos, muchos, "PE").simulacros).toHaveLength(10);
  });
});

describe("normalizarTransferencia", () => {
  const valido = { version: 1, perfil: { nombre: "Valeria", avatar: "nova", hada: "nova" }, progreso: { PE: { xp: "420" }, FP: null } };

  it("normaliza perfil y las dos materias; una materia ausente o rota queda vacía", () => {
    const r = normalizarTransferencia(valido);
    expect(r.perfil).toEqual({ nombre: "Valeria", avatar: "nova" });
    expect(r.progreso.PE.xp).toBe(420);
    expect(r.progreso.FP).toEqual(progresoVacio());
  });

  it("rechaza lo que no es un enlace de esta app", () => {
    for (const malo of [null, "x", [], {}, { ...valido, version: 2 }, { ...valido, version: undefined }, { ...valido, perfil: null }, { ...valido, perfil: { nombre: "" } }, { ...valido, progreso: [] }, { ...valido, progreso: null }]) {
      expect(normalizarTransferencia(malo), JSON.stringify(malo)).toBeNull();
    }
  });
});

import LZString from "lz-string";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { claveProgreso } from "./almacenamiento.js";
import { MAX_JSON, MAX_PARAMETRO, crearEnlace, decodificarEnlace } from "./transferencia.js";
import { progresoVacio } from "./validacion.js";

const PERFIL = { nombre: "Daniela", avatar: "lyra" };
const comprimir = (datos) => LZString.compressToEncodedURIComponent(typeof datos === "string" ? datos : JSON.stringify(datos));
const hashDe = (d) => `#/importar?d=${encodeURIComponent(d)}`;
const hashDelEnlace = (enlace) => enlace.slice(enlace.indexOf("#"));

function instalarEntorno(guardado = {}) {
  const datos = new Map(Object.entries(guardado).map(([k, v]) => [k, JSON.stringify(v)]));
  vi.stubGlobal("localStorage", {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
  });
  vi.stubGlobal("location", { origin: "https://grimorio.example", pathname: "/", hash: "" });
}

// Progreso lo más grande que puede ser en la práctica: todos los reactivos con intentos altos,
// 10 simulacros con las notas por tema y 90 días de estudio.
function progresoMaximo(materia) {
  const preguntas = Object.fromEntries(CONTENIDO[materia].PREGUNTAS.map((p, i) => [p.id, { intentos: 100 + i, aciertos: 50 + i, ultimo: i % 2 === 0 }]));
  const porTema = Object.fromEntries(Array.from({ length: 10 }, (_, t) => [t + 1, { ok: 1 + (t % 2), total: 3 + (t % 4) }]));
  const simulacros = Array.from({ length: 10 }, (_, i) => ({ fecha: `2026-06-${String(i + 1).padStart(2, "0")}T18:20:00.000Z`, aciertos: 10 + i, total: 20, calificacion: 50 + 4 * i, porTema }));
  const base = Date.UTC(2026, 2, 17);
  const diasEstudio = Array.from({ length: 90 }, (_, i) => new Date(base + i * 86_400_000).toISOString().slice(0, 10));
  return { xp: 99_999, preguntas, simulacros, diasEstudio };
}

describe("enlace de transferencia · ida y vuelta", () => {
  beforeEach(() => instalarEntorno());
  afterEach(() => vi.unstubAllGlobals());

  it("lo que se exporta es lo que se importa", () => {
    const PE = { ...progresoMaximo("PE"), xp: 420 };
    const FP = { ...progresoMaximo("FP"), xp: 150 };
    instalarEntorno({ [claveProgreso("PE")]: PE, [claveProgreso("FP")]: FP });
    const r = decodificarEnlace(hashDelEnlace(crearEnlace(PERFIL)));
    expect(r.perfil).toEqual(PERFIL);
    expect(r.progreso.PE).toEqual(PE);
    expect(r.progreso.FP).toEqual(FP);
  });

  it("sin nada guardado, el enlace trae las dos materias vacías", () => {
    const r = decodificarEnlace(hashDelEnlace(crearEnlace(PERFIL)));
    expect(r.progreso).toEqual({ PE: progresoVacio(), FP: progresoVacio() });
  });

  it("un enlace con datos corruptos se limpia al decodificarlo", () => {
    const sucio = { version: 1, perfil: { nombre: "x".repeat(10_000), avatar: "dragon", hada: "nova" }, progreso: { PE: { xp: "250", preguntas: [1, 2], simulacros: "no" }, FP: [] } };
    const r = decodificarEnlace(hashDe(comprimir(sucio)));
    expect(r.perfil).toEqual({ nombre: "x".repeat(32), avatar: "riley" });
    expect(r.progreso.PE).toEqual({ xp: 250, preguntas: {}, simulacros: [], diasEstudio: [] });
    expect(r.progreso.FP).toEqual(progresoVacio());
  });
});

describe("enlace de transferencia · límites de tamaño", () => {
  let descomprimir;
  beforeEach(() => {
    instalarEntorno();
    descomprimir = vi.spyOn(LZString, "decompressFromEncodedURIComponent");
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("el enlace más grande que genera la app cabe con holgura en los límites", () => {
    instalarEntorno({ [claveProgreso("PE")]: progresoMaximo("PE"), [claveProgreso("FP")]: progresoMaximo("FP") });
    const enlace = crearEnlace({ nombre: "n".repeat(32), avatar: "onyx" });
    const parametro = decodeURIComponent(enlace.split("?d=")[1]);
    const json = LZString.decompressFromEncodedURIComponent(parametro);
    console.info(`enlace máximo real: d=${parametro.length} caracteres comprimido, ${json.length} de JSON (límites ${MAX_PARAMETRO} y ${MAX_JSON})`);
    expect(parametro.length).toBeLessThan(MAX_PARAMETRO / 2);
    expect(json.length).toBeLessThan(MAX_JSON / 2);
    expect(decodificarEnlace(hashDelEnlace(enlace))).not.toBeNull();
  });

  it("un enlace gigante se rechaza ANTES de descomprimir", () => {
    const t0 = performance.now();
    expect(decodificarEnlace(hashDe("A".repeat(5_000_000)))).toBeNull();
    expect(decodificarEnlace("#/importar?d=" + "A".repeat(MAX_PARAMETRO + 1))).toBeNull();
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(descomprimir).not.toHaveBeenCalled();
  });

  it("un parámetro justo en el límite sí llega a descomprimirse", () => {
    decodificarEnlace("#/importar?d=" + "A".repeat(MAX_PARAMETRO));
    expect(descomprimir).toHaveBeenCalledTimes(1);
  });

  it("un enlace pequeño que se descomprime a algo enorme se rechaza DESPUÉS de descomprimir", () => {
    const bomba = comprimir("a".repeat(1_000_000));
    expect(bomba.length).toBeLessThan(MAX_PARAMETRO); // pasa el primer filtro…
    expect(decodificarEnlace(hashDe(bomba))).toBeNull(); // …y no el segundo
    expect(descomprimir).toHaveBeenCalledTimes(1);
  });
});

describe("enlace de transferencia · enlaces inválidos", () => {
  beforeEach(() => instalarEntorno());
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["sin hash", ""],
    ["sin parámetro d", "#/importar"],
    ["d vacío", "#/importar?d="],
    ["basura", "#/importar?d=basura"],
    ["caracteres que LZString no entiende", "#/importar?d=%E0%A4%A"],
  ])("%s → null sin tronar", (_, hash) => {
    expect(decodificarEnlace(hash)).toBeNull();
  });

  it("JSON roto, tipos equivocados y versión desconocida → null", () => {
    expect(decodificarEnlace(hashDe(comprimir("{no es json")))).toBeNull();
    expect(decodificarEnlace(hashDe(comprimir("[1,2,3]")))).toBeNull();
    expect(decodificarEnlace(hashDe(comprimir("null")))).toBeNull();
    expect(decodificarEnlace(hashDe(comprimir({ version: 9, perfil: PERFIL, progreso: {} })))).toBeNull();
    expect(decodificarEnlace(hashDe(comprimir({ version: 1, perfil: { nombre: "" }, progreso: {} })))).toBeNull();
  });
});

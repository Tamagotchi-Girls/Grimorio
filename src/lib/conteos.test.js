import { describe, expect, it } from "vitest";
import { CONTENIDO } from "../data/contenido.js";
import { MATERIAS, materiaPorId } from "../data/materias.js";
import { PREGUNTAS_POR_SIMULACRO } from "./constantes.js";
import {
  reactivosPorTema,
  reactivosPorTemaEnSimulacro,
  temaSiguiente,
  textoCaminoSimulacro,
  textoCaminoTemas,
  textoNumeroDeTema,
  textoReglaSimulacro,
  textoResumenMateria,
  textoTemasCompletos,
  totalSimulacro,
} from "./conteos.js";

// Los textos que estaban escritos a mano en Inicio.jsx, Tema.jsx y Simulacro.jsx ANTES de derivarlos.
const ANTES = {
  resumen: "60 reactivos de los 10 temas del programa.",
  caminoTemas: "Apuntes y 6 reactivos por tema, con explicación al instante.",
  caminoSimulacro: "20 reactivos al azar. Calificación al final.",
  reglaSimulacro: "20 reactivos al azar: 2 de cada uno de los 10 temas.",
  tema: (id) => `Tema ${String(id).padStart(2, "0")} de 10`,
  completos: (n) => `${n} de 10 temas completos`,
};

describe.each(Object.entries(CONTENIDO))("textos derivados de %s: idénticos a los de antes", (materia, { TEMAS, PREGUNTAS }) => {
  it("los datos son los de siempre: 60 reactivos, 10 temas, 6 por tema", () => {
    expect(PREGUNTAS).toHaveLength(60);
    expect(TEMAS).toHaveLength(10);
    expect(reactivosPorTema(TEMAS, PREGUNTAS)).toBe(6);
  });

  it("el simulacro: 20 reactivos, 2 por tema", () => {
    expect(PREGUNTAS_POR_SIMULACRO).toBe(20);
    expect(reactivosPorTemaEnSimulacro(TEMAS)).toBe(2);
    expect(totalSimulacro(TEMAS)).toBe(20);
  });

  it("portada de Inicio", () => {
    expect(textoResumenMateria(TEMAS, PREGUNTAS)).toBe(ANTES.resumen);
    expect(textoCaminoTemas(TEMAS, PREGUNTAS)).toBe(ANTES.caminoTemas);
    expect(textoCaminoSimulacro(TEMAS)).toBe(ANTES.caminoSimulacro);
    for (const n of [0, 1, 7, 10]) expect(textoTemasCompletos(n, TEMAS), `${n}`).toBe(ANTES.completos(n));
  });

  it("regla del simulacro y 'Tema X de N' de cada tema", () => {
    expect(textoReglaSimulacro(TEMAS)).toBe(ANTES.reglaSimulacro);
    for (const t of TEMAS) expect(textoNumeroDeTema(t.id, TEMAS), `tema ${t.id}`).toBe(ANTES.tema(t.id));
  });

  it("cada tema tiene reactivos suficientes para el simulacro", () => {
    const k = reactivosPorTemaEnSimulacro(TEMAS);
    for (const t of TEMAS) expect(PREGUNTAS.filter((p) => p.tema === t.id).length, `tema ${t.id} (${materia})`).toBeGreaterThanOrEqual(k);
  });

  it("el tema siguiente es el de la posición siguiente: igual que id + 1 con estos datos", () => {
    for (const t of TEMAS) expect(temaSiguiente(TEMAS, t.id), `tema ${t.id}`).toBe(TEMAS.find((x) => x.id === t.id + 1));
    expect(temaSiguiente(TEMAS, TEMAS.at(-1).id)).toBeUndefined();
  });
});

describe("si cambian los datos, los textos siguen a los datos", () => {
  const temas = (...ids) => ids.map((id) => ({ id }));
  const preguntas = (...cuentas) => cuentas.flatMap((n, k) => Array.from({ length: n }, () => ({ tema: k + 1 })));

  it("reactivos por tema: el número si es parejo; si no, se omite", () => {
    expect(reactivosPorTema(temas(1, 2), preguntas(4, 4))).toBe(4);
    expect(reactivosPorTema(temas(1, 2), preguntas(4, 5))).toBeNull();
    expect(reactivosPorTema([], [])).toBeNull();
    expect(textoCaminoTemas(temas(1, 2), preguntas(4, 4))).toBe("Apuntes y 4 reactivos por tema, con explicación al instante.");
    expect(textoCaminoTemas(temas(1, 2), preguntas(4, 5))).toBe("Apuntes y reactivos por tema, con explicación al instante.");
  });

  it("el simulacro se reparte entre los temas que haya", () => {
    expect(reactivosPorTemaEnSimulacro(temas(1, 2, 3, 4))).toBe(5);
    expect(textoReglaSimulacro(temas(1, 2, 3, 4))).toBe("20 reactivos al azar: 5 de cada uno de los 4 temas.");
    // 20 no se reparte parejo entre 3 temas: el texto dice los que sí caben
    expect(textoReglaSimulacro(temas(1, 2, 3))).toBe("18 reactivos al azar: 6 de cada uno de los 3 temas.");
    expect(textoNumeroDeTema(3, temas(1, 2, 3, 4))).toBe("Tema 03 de 4");
  });

  it("el tema siguiente sale de la posición, aunque los ids no sean consecutivos", () => {
    const t = temas(1, 2, 5, 9);
    expect(temaSiguiente(t, 2).id).toBe(5);
    expect(temaSiguiente(t, 5).id).toBe(9);
    expect(temaSiguiente(t, 9)).toBeUndefined();
    expect(temaSiguiente(t, 3)).toBeUndefined(); // un id que no existe
  });
});

describe("materias", () => {
  it("son las mismas que tiene el contenido, en el mismo orden", () => {
    expect(MATERIAS.map((m) => m.id)).toEqual(Object.keys(CONTENIDO));
  });

  it("nombre, etiqueta y clave son los textos de siempre", () => {
    expect(MATERIAS).toEqual([
      { id: "PE", nombre: "Programación Estructurada", etiqueta: "Programación Estructurada · IL352", clave: "IL352" },
      { id: "FP", nombre: "Fundamentos de Programación", etiqueta: "Fundamentos de Programación", clave: "Departamental" },
    ]);
    expect(materiaPorId("FP").etiqueta).toBe("Fundamentos de Programación");
    expect(materiaPorId("XX")).toBeUndefined();
  });

  it("FP no menciona la escuela ni una clave de materia", () => {
    const fp = JSON.stringify(materiaPorId("FP"));
    expect(fp).not.toMatch(/IL\d{3}|CUCEI|UdeG|Universidad|Centro/i);
  });
});

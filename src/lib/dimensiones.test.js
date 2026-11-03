import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_DIAS_RACHA, MAX_SIMULACROS, PREGUNTAS_POR_SIMULACRO } from "./constantes.js";
import { HADA, PAISAJE, TAMANO_QR } from "./dimensiones.js";
import { LIMITES } from "./validacion.js";

const leer = (ruta) => fs.readFileSync(new URL(ruta, import.meta.url), "utf8");
// los estilos viven en src/styles/*.css; index.css solo los importa
const css = fs.readdirSync(new URL("../styles/", import.meta.url)).map((f) => leer(`../styles/${f}`)).join("\n");
const variable = (nombre) => Number(css.match(new RegExp(`--${nombre}:\\s*(\\d+)px`))?.[1]);

// PNG: ancho y alto están en la cabecera IHDR (bytes 16–23).
const tamanoPNG = (ruta) => {
  const b = fs.readFileSync(new URL(ruta, import.meta.url));
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
};

describe("dimensiones: JS y CSS dicen lo mismo", () => {
  it("las variables del CSS son las constantes de dimensiones.js", () => {
    expect(variable("paisaje-ancho")).toBe(PAISAJE.ancho);
    expect(variable("paisaje-alto")).toBe(PAISAJE.alto);
    expect(variable("paisaje-tira")).toBe(PAISAJE.anchoTira);
    expect(variable("hada-ancho")).toBe(HADA.ancho);
    expect(variable("hada-alto")).toBe(HADA.alto);
    expect(PAISAJE.anchoTira).toBe(PAISAJE.ancho * PAISAJE.fotogramas);
  });

  it("y esos tamaños son los de los PNG de verdad (de todas las hadas)", () => {
    for (const hada of ["riley", "lyra", "vega", "aura", "nova", "onyx"]) {
      expect(tamanoPNG(`../../public/sprites/paisajes/${hada}/${hada}_paisaje_tira_4x.png`), `tira de ${hada}`).toEqual({ ancho: PAISAJE.anchoTira, alto: PAISAJE.alto });
      expect(tamanoPNG(`../../public/sprites/hadas/${hada}/${hada}_00_reposo.png`), `hada ${hada}`).toEqual({ ancho: HADA.ancho, alto: HADA.alto });
      expect(tamanoPNG(`../../public/sprites/hadas/${hada}/${hada}_00_reposo@2x.png`), `hada ${hada} @2x`).toEqual({ ancho: HADA.ancho * 2, alto: HADA.alto * 2 });
    }
  });

  it("ya no quedan 960px, 540px ni 3840px escritos a mano en el CSS (solo en las variables)", () => {
    const sinVariables = css.replace(/--(paisaje|hada)-[a-z]+:\s*\d+px;/g, "");
    expect(sinVariables).not.toMatch(/\b(960|540|3840)px/);
  });

  it("ni 960, 540 ni 3840 en el JS de la escena, el hada y el QR", () => {
    for (const f of ["../components/Escena.jsx", "../components/Hada.jsx", "../components/Transferencia.jsx"]) {
      expect(leer(f), f).not.toMatch(/\b(960|540|3840)\b/);
    }
  });

  it("el QR tiene su propio tamaño", () => {
    expect(TAMANO_QR).toBe(320);
    expect(leer("../components/Transferencia.jsx")).toMatch(/width: TAMANO_QR/);
  });
});

describe("constantes de estudio", () => {
  it("valen lo de siempre", () => {
    expect([MAX_DIAS_RACHA, MAX_SIMULACROS, PREGUNTAS_POR_SIMULACRO]).toEqual([90, 10, 20]);
  });

  it("la validación usa las mismas, y el simulacro se reparte parejo entre los 10 temas", () => {
    expect(LIMITES.diasEstudio).toBe(MAX_DIAS_RACHA);
    expect(LIMITES.simulacros).toBe(MAX_SIMULACROS);
    expect(PREGUNTAS_POR_SIMULACRO % 10).toBe(0);
  });
});

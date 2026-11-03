import fs from "node:fs";
import { describe, expect, it } from "vitest";

// Los cortes de pantalla permitidos (la misma lista está documentada al inicio de styles/tokens.css).
// 601 y 1099 son el lado de "más de" / "hasta" de 600 y 1100.
const ANCHOS = [420, 430, 600, 601, 640, 900, 1099, 1100, 1500];
const ALTOS = [700];
const PROPORCIONES = ["4/3"];

const carpeta = new URL("../styles/", import.meta.url);
const consultas = fs.readdirSync(carpeta).flatMap((archivo) => {
  const css = fs.readFileSync(new URL(archivo, carpeta), "utf8");
  return [...css.matchAll(/@media([^{]*)\{/g)].map((m) => ({ archivo, consulta: m[1].trim() }));
});

describe("cortes de pantalla", () => {
  it("encuentra los @media del CSS", () => {
    expect(consultas.length).toBeGreaterThan(5);
  });

  it("todo @media usa solo cortes de la lista", () => {
    for (const { archivo, consulta } of consultas) {
      for (const m of consulta.matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)) expect(ANCHOS, `${archivo}: ${consulta}`).toContain(Number(m[1]));
      for (const m of consulta.matchAll(/\((?:min|max)-height:\s*(\d+)px\)/g)) expect(ALTOS, `${archivo}: ${consulta}`).toContain(Number(m[1]));
      for (const m of consulta.matchAll(/aspect-ratio:\s*([\d/]+)\)/g)) expect(PROPORCIONES, `${archivo}: ${consulta}`).toContain(m[1]);
    }
  });
});

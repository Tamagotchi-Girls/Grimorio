import { describe, expect, it } from "vitest";
import { rutaDe } from "./ruta.js";

describe("rutaDe", () => {
  it("quita # y la barra inicial", () => {
    expect(rutaDe("#/temas")).toBe("temas");
    expect(rutaDe("#temas")).toBe("temas");
    expect(rutaDe("#/tema/3")).toBe("tema/3");
  });
  it("la raíz es la cadena vacía", () => {
    expect(rutaDe("")).toBe("");
    expect(rutaDe("#")).toBe("");
    expect(rutaDe("#/")).toBe("");
  });
  it("ignora los parámetros", () => {
    expect(rutaDe("#/importar?d=abc")).toBe("importar");
    expect(rutaDe("#/?x=1")).toBe("");
  });
});

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CONTENIDO } from "./contenido.js";

// Compila con gcc cada reactivo "imprime" y comprueba que la opción correcta sea exactamente
// la salida del programa (regla de AGENTS.md). Sin gcc, las pruebas se saltan con un aviso.
// Se ignora solo el espacio en blanco FINAL: no se ve en pantalla (una opción de respuesta no puede
// mostrar un espacio o un salto de línea al terminar), así que el texto de la opción y la salida real
// difieren solo ahí. Hoy lo necesitan 4 reactivos de PE, cuyo contenido no se modifica por decisión
// del proyecto:
//   t2-3  termina con un salto de línea ("*\n**\n***\n")
//   t2-5  termina con un espacio ("dos tres ")
//   t9-3  termina con un espacio ("3 2 1 ")
//   t9-4  termina con un espacio ("1 2 3 ")
// Cualquier otra diferencia (incluido el espacio en blanco en medio) sigue haciendo fallar la prueba.
const hayGcc = spawnSync("gcc", ["--version"]).status === 0;
if (!hayGcc) console.warn("[imprime.gcc] gcc no está instalado: se omite la verificación de reactivos 'imprime'.");

const CABECERAS = ["stdio.h", "stdlib.h", "string.h", "math.h", "ctype.h", "stdbool.h", "limits.h"]
  .map((h) => `#include <${h}>`)
  .join("\n");

// Las líneas que abren una definición a nivel superior (struct, typedef, función) se dejan fuera
// de main; el resto de las líneas del fragmento se ejecuta dentro de main.
const ABRE_DEFINICION =
  /^(struct\s+\w+\s*\{|typedef\b|(?:static\s+)?(?:void|int|float|double|char|long|unsigned|struct\s+\w+)\s*\**\s*\w+\s*\([^;]*\)\s*\{)/;

const sinColaEnBlanco = (texto) => texto.replace(/\s+$/, "");

const llaves = (linea) => (linea.match(/\{/g) || []).length - (linea.match(/\}/g) || []).length;

function armarPrograma(codigo) {
  if (/\bmain\s*\(/.test(codigo)) return `${CABECERAS}\n${codigo}\n`;

  const globales = [];
  const cuerpo = [];
  const lineas = codigo.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    if (!ABRE_DEFINICION.test(lineas[i])) {
      cuerpo.push(lineas[i]);
      continue;
    }
    let profundidad = llaves(lineas[i]);
    globales.push(lineas[i]);
    while (profundidad > 0 && i + 1 < lineas.length) {
      i++;
      profundidad += llaves(lineas[i]);
      globales.push(lineas[i]);
    }
  }
  return `${CABECERAS}\n${globales.join("\n")}\nint main(void) {\n${cuerpo.join("\n")}\nreturn 0;\n}\n`;
}

let carpeta;
beforeAll(() => {
  if (hayGcc) carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "grimorio-gcc-"));
});
afterAll(() => {
  if (carpeta) fs.rmSync(carpeta, { recursive: true, force: true });
});

function compilarYCorrer(id, codigo) {
  const fuente = path.join(carpeta, `${id}.c`);
  const binario = path.join(carpeta, id);
  fs.writeFileSync(fuente, armarPrograma(codigo));
  const compilacion = spawnSync("gcc", ["-w", "-o", binario, fuente, "-lm"], { encoding: "utf8" });
  if (compilacion.status !== 0) return { error: `no compila:\n${compilacion.stderr}` };
  const ejecucion = spawnSync(binario, [], { encoding: "utf8", timeout: 5000, input: "", cwd: carpeta });
  if (ejecucion.status !== 0) return { error: `terminó con código ${ejecucion.status}` };
  return { salida: ejecucion.stdout };
}

describe.skipIf(!hayGcc).each(Object.entries(CONTENIDO))("reactivos 'imprime' de %s", (_materia, { PREGUNTAS }) => {
  const imprime = PREGUNTAS.filter((p) => p.tipo === "imprime");

  it("hay reactivos de este tipo", () => {
    expect(imprime.length).toBeGreaterThan(0);
  });

  it.each(imprime.map((p) => [p.id, p]))("%s: la opción correcta es la salida del programa", (id, p) => {
    const resultado = compilarYCorrer(id, p.codigo);
    expect(resultado.error, resultado.error).toBeUndefined();
    expect(sinColaEnBlanco(resultado.salida)).toBe(sinColaEnBlanco(p.opciones[p.correcta]));
  });
});

// Capturas de referencia para comparar la interfaz antes y después de un refactor.
//
//   pnpm build
//   pnpm capturas base                  # guarda capturas/base/
//   pnpm capturas fase-2 --base base    # guarda capturas/fase-2/ y la compara con capturas/base/
//
// Opciones: --build (corre `vite build` antes), --solo <texto> (solo pantallas cuyo nombre lo contenga),
// --puerto <n> (por defecto 4173).
//
// Para que dos corridas sean idénticas se fija todo lo que cambia solo: reloj (2026-06-15 10:30),
// Math.random (generador con semilla), zona horaria, movimiento reducido (sin animaciones ni
// máquina de escribir) y el contenido de localStorage, que se reescribe en cada carga.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import LZString from "lz-string";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { PREGUNTAS as PREGUNTAS_PE } from "../src/data/preguntas.js";
import { PREGUNTAS as PREGUNTAS_FP } from "../src/data/fp/preguntas.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAPTURAS = path.join(RAIZ, "capturas");

// ───────── argumentos
const args = process.argv.slice(2);
const opcion = (nombre) => {
  const i = args.indexOf(`--${nombre}`);
  return i === -1 ? null : args[i + 1] ?? true;
};
const nombreCarpeta = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!nombreCarpeta) {
  console.error("Uso: pnpm capturas <carpeta> [--base <carpeta-base>] [--build] [--solo <texto>] [--puerto <n>]");
  process.exit(2);
}
const carpetaBase = opcion("base");
const filtro = opcion("solo");
const PUERTO = Number(opcion("puerto")) || 4173;
const URL_APP = `http://127.0.0.1:${PUERTO}`;

// ───────── datos de prueba
const AHORA = new Date("2026-06-15T10:30:00-06:00");
const DIAS_ESTUDIO = ["2026-06-13", "2026-06-14", "2026-06-15"];
const PERFIL = { nombre: "Daniela", avatar: "lyra", hada: "lyra" };
const PERFIL_IMPORTADO = { nombre: "Valeria", avatar: "nova", hada: "nova" };

// Un tercio dominado, un tercio fallado y un tercio sin intentar: se ven los tres estados de los "pips".
function progreso(preguntas, xp) {
  const mapa = {};
  preguntas.forEach((p, i) => {
    if (i % 3 === 0) mapa[p.id] = { intentos: 2, aciertos: 2, ultimo: true };
    else if (i % 3 === 1) mapa[p.id] = { intentos: 2, aciertos: 1, ultimo: false };
  });
  return {
    xp,
    preguntas: mapa,
    simulacros: [
      { fecha: "2026-06-13T18:20:00.000Z", aciertos: 12, total: 20, calificacion: 60, porTema: {} },
      { fecha: "2026-06-14T19:05:00.000Z", aciertos: 17, total: 20, calificacion: 85, porTema: {} },
    ],
    diasEstudio: DIAS_ESTUDIO,
  };
}
const PROGRESO_PE = progreso(PREGUNTAS_PE, 235);
const PROGRESO_FP = progreso(PREGUNTAS_FP, 80);

const enlaceImportar = () => {
  const datos = { version: 1, perfil: PERFIL_IMPORTADO, progreso: { PE: progreso(PREGUNTAS_PE, 420), FP: progreso(PREGUNTAS_FP, 150) } };
  return `/#/importar?d=${encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(datos)))}`;
};

// Estado inicial de localStorage por escenario (las claves son las que usa la app hoy).
const ESCENARIOS = {
  sinPerfil: () => ({}),
  sinMateria: () => ({ "grimorio-perfil-v1": PERFIL }),
  pe: () => ({
    "grimorio-perfil-v1": PERFIL,
    "grimorio-materia-activa": "PE",
    "guia-pe-progreso-v1": PROGRESO_PE,
    "guia-fp-progreso-v1": PROGRESO_FP,
  }),
  fp: () => ({
    "grimorio-perfil-v1": PERFIL,
    "grimorio-materia-activa": "FP",
    "guia-pe-progreso-v1": PROGRESO_PE,
    "guia-fp-progreso-v1": PROGRESO_FP,
  }),
};

// ───────── pantallas
// Cada una: escenario, hash inicial y, si hace falta, pasos para llegar al estado deseado.
// `fin: true` toma además una captura con la pantalla desplazada hasta abajo.
const boton = (page, nombre, opciones = {}) => page.getByRole("button", { name: nombre, ...opciones });
const reactivosTema1 = PREGUNTAS_PE.filter((p) => p.tema === 1).length;

const PANTALLAS = [
  { nombre: "bienvenida-nombre", escenario: "sinPerfil", hash: "/" },
  {
    nombre: "bienvenida-hada",
    escenario: "sinPerfil",
    hash: "/",
    pasos: async (page) => {
      await page.getByRole("textbox").fill("Daniela");
      await boton(page, /SIGUIENTE/).click();
    },
  },
  { nombre: "materias", escenario: "sinMateria", hash: "/" },
  { nombre: "inicio-pe", escenario: "pe", hash: "/", fin: true },
  { nombre: "inicio-fp", escenario: "fp", hash: "/", fin: true },
  { nombre: "temas", escenario: "pe", hash: "/temas", fin: true },
  { nombre: "tema-apuntes", escenario: "pe", hash: "/tema/1", fin: true },
  {
    nombre: "tema-practica",
    escenario: "pe",
    hash: "/tema/1",
    fin: true,
    pasos: async (page) => {
      await page.getByRole("tab", { name: "Practicar" }).click();
      await page.keyboard.press("1");
    },
  },
  {
    nombre: "tema-resultado",
    escenario: "pe",
    hash: "/tema/1",
    pasos: async (page) => {
      await page.getByRole("tab", { name: "Practicar" }).click();
      for (let k = 0; k < reactivosTema1; k++) {
        await page.keyboard.press("1");
        await page.keyboard.press("Enter");
      }
    },
  },
  { nombre: "simulacro-intro", escenario: "pe", hash: "/simulacro" },
  {
    nombre: "simulacro-jugando",
    escenario: "pe",
    hash: "/simulacro",
    pasos: async (page) => {
      await boton(page, "Empezar simulacro").click();
      await page.keyboard.press("2");
    },
  },
  {
    nombre: "simulacro-confirmar",
    escenario: "pe",
    hash: "/simulacro",
    fin: true,
    pasos: async (page) => {
      await boton(page, "Empezar simulacro").click();
      await page.keyboard.press("2");
      await boton(page, "Terminar simulacro").click();
    },
  },
  {
    nombre: "simulacro-resultados",
    escenario: "pe",
    hash: "/simulacro",
    fin: true,
    pasos: async (page) => {
      await boton(page, "Empezar simulacro").click();
      // 9 vueltas: termina en la pregunta 19, donde todavía existe el botón "Terminar simulacro"
      for (let k = 0; k < 9; k++) {
        await page.keyboard.press("1");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
      }
      await boton(page, "Terminar simulacro").click();
      await page.getByRole("alertdialog").getByRole("button", { name: "Terminar", exact: true }).click();
    },
  },
  { nombre: "progreso", escenario: "pe", hash: "/progreso", fin: true },
  {
    nombre: "progreso-nombre",
    escenario: "pe",
    hash: "/progreso",
    pasos: async (page) => {
      await boton(page, "Cambiar nombre").click();
    },
  },
  {
    nombre: "progreso-borrar",
    escenario: "pe",
    hash: "/progreso",
    fin: true,
    pasos: async (page) => {
      await boton(page, /Borrar progreso/).click();
    },
  },
  { nombre: "elegir-hada", escenario: "pe", hash: "/hada" },
  { nombre: "importar", escenario: "pe", hash: null },
  {
    nombre: "importar-reemplazar",
    escenario: "pe",
    hash: null,
    pasos: async (page) => {
      await boton(page, "Reemplazar mi progreso actual").click();
    },
  },
  { nombre: "importar-invalido", escenario: "pe", hash: "/importar?d=basura" },
];

const VIEWPORTS = [
  { nombre: "1440x900", width: 1440, height: 900 },
  { nombre: "820x1180", width: 820, height: 1180 },
  { nombre: "390x844", width: 390, height: 844 },
];
const MODOS = ["claro", "oscuro"];

// ───────── servidor de la build
async function esperar(url, intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* todavía no arranca */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en ${url}`);
}

function iniciarPreview() {
  const vite = path.join(RAIZ, "node_modules", "vite", "bin", "vite.js");
  const hijo = spawn(process.execPath, [vite, "preview", "--port", String(PUERTO), "--strictPort", "--host", "127.0.0.1"], {
    cwd: RAIZ,
    env: { ...process.env, PORT: String(PUERTO) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  hijo.stderr.on("data", (d) => process.stderr.write(d));
  return hijo;
}

// ───────── captura
// Se ejecuta antes de que cargue la página: reloj fijo ya lo pone Playwright; aquí van la semilla
// de Math.random y el contenido de localStorage.
const preparacion = ({ almacen, tema }) => {
  let s = 123456789;
  Math.random = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  localStorage.clear();
  for (const [clave, valor] of Object.entries(almacen)) localStorage.setItem(clave, JSON.stringify(valor));
  // la materia activa y el tema se guardan como texto plano, no como JSON
  if (almacen["grimorio-materia-activa"]) localStorage.setItem("grimorio-materia-activa", almacen["grimorio-materia-activa"]);
  localStorage.setItem("guia-pe-tema", tema);
};

async function estabilizar(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete));
  await page.waitForTimeout(350); // deja que Escena calcule su escala con ResizeObserver
}

async function capturarPantalla(contexto, pantalla, vp, modo, destino) {
  const almacen = ESCENARIOS[pantalla.escenario]();
  const page = await contexto.newPage();
  page.setDefaultTimeout(8000);
  try {
    await page.addInitScript(preparacion, { almacen, tema: modo === "oscuro" ? "dark" : "light" });
    const ruta = pantalla.hash === null ? enlaceImportar() : `/#${pantalla.hash}`;
    await page.goto(URL_APP + ruta, { waitUntil: "networkidle" });
    await estabilizar(page);
    if (pantalla.pasos) {
      await pantalla.pasos(page);
      await estabilizar(page);
    }
    const base = `${pantalla.nombre}__${vp.nombre}__${modo}`;
    await page.screenshot({ path: path.join(destino, `${base}.png`) });
    if (pantalla.fin) {
      const hayScroll = await page.evaluate(() => {
        const p = document.querySelector(".pantalla");
        if (!p || p.scrollHeight <= p.clientHeight + 1) return false;
        p.scrollTop = p.scrollHeight;
        return true;
      });
      if (hayScroll) {
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(destino, `${base}__fin.png`) });
      }
    }
  } finally {
    await page.close();
  }
}

// ───────── comparación con pixelmatch
function comparar(carpetaNueva, carpetaVieja) {
  const dirDiff = path.join(carpetaNueva, "_diff");
  fs.rmSync(dirDiff, { recursive: true, force: true });
  const nuevas = fs.readdirSync(carpetaNueva).filter((f) => f.endsWith(".png"));
  const viejas = new Set(fs.readdirSync(carpetaVieja).filter((f) => f.endsWith(".png")));
  const cambios = [];
  let iguales = 0;
  const nuevasSinBase = [];

  for (const archivo of nuevas) {
    if (!viejas.delete(archivo)) {
      nuevasSinBase.push(archivo);
      continue;
    }
    const a = PNG.sync.read(fs.readFileSync(path.join(carpetaVieja, archivo)));
    const b = PNG.sync.read(fs.readFileSync(path.join(carpetaNueva, archivo)));
    if (a.width !== b.width || a.height !== b.height) {
      cambios.push({ archivo, motivo: `tamaño ${a.width}x${a.height} → ${b.width}x${b.height}`, porcentaje: 100 });
      continue;
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const pixeles = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
    if (pixeles === 0) {
      iguales++;
      continue;
    }
    fs.mkdirSync(dirDiff, { recursive: true });
    fs.writeFileSync(path.join(dirDiff, archivo), PNG.sync.write(diff));
    cambios.push({ archivo, pixeles, porcentaje: (pixeles / (a.width * a.height)) * 100 });
  }

  console.log(`\nComparación ${path.basename(carpetaNueva)} contra ${path.basename(carpetaVieja)}`);
  console.log(`  iguales: ${iguales}   distintas: ${cambios.length}   nuevas: ${nuevasSinBase.length}   faltan: ${viejas.size}`);
  if (cambios.length) {
    console.log("\n  Pantallas que cambiaron (diferencias en _diff/):");
    for (const c of cambios.sort((x, y) => y.porcentaje - x.porcentaje)) {
      const detalle = c.motivo ?? `${c.pixeles} px`;
      console.log(`    ${c.porcentaje.toFixed(3).padStart(8)} %  ${c.archivo.replace(".png", "")}  (${detalle})`);
    }
  }
  if (nuevasSinBase.length) console.log(`\n  Sin captura base: ${nuevasSinBase.join(", ")}`);
  if (viejas.size) console.log(`\n  Estaban en la base y ya no: ${[...viejas].join(", ")}`);
  return cambios.length + nuevasSinBase.length + viejas.size;
}

// ───────── principal
async function main() {
  if (opcion("build")) {
    const r = spawnSync(process.execPath, [path.join(RAIZ, "node_modules", "vite", "bin", "vite.js"), "build"], { cwd: RAIZ, stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
  if (!fs.existsSync(path.join(RAIZ, "dist", "index.html"))) {
    console.error("No existe dist/. Corre `pnpm build` primero (o usa --build).");
    process.exit(2);
  }

  const destino = path.join(CAPTURAS, nombreCarpeta);
  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });

  const servidor = iniciarPreview();
  const navegador = await chromium.launch();
  const fallos = [];
  let total = 0;
  try {
    await esperar(URL_APP);
    const pantallas = PANTALLAS.filter((p) => !filtro || p.nombre.includes(filtro));
    for (const vp of VIEWPORTS) {
      for (const modo of MODOS) {
        const contexto = await navegador.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          locale: "es-MX",
          timezoneId: "America/Mexico_City",
          colorScheme: modo === "oscuro" ? "dark" : "light",
          reducedMotion: "reduce",
        });
        await contexto.clock.setFixedTime(AHORA);
        for (const pantalla of pantallas) {
          try {
            await capturarPantalla(contexto, pantalla, vp, modo, destino);
            total++;
          } catch (error) {
            fallos.push(`${pantalla.nombre} ${vp.nombre} ${modo}: ${error.message.split("\n")[0]}`);
          }
        }
        await contexto.close();
        console.log(`  ${vp.nombre} ${modo}: listo`);
      }
    }
  } finally {
    await navegador.close();
    servidor.kill();
  }

  console.log(`\n${total} pantallas guardadas en capturas/${nombreCarpeta}/`);
  if (fallos.length) {
    console.error(`\n${fallos.length} captura(s) fallaron:\n  ${fallos.join("\n  ")}`);
    process.exitCode = 1;
  }
  if (carpetaBase) {
    const vieja = path.join(CAPTURAS, carpetaBase);
    if (!fs.existsSync(vieja)) {
      console.error(`No existe la carpeta base capturas/${carpetaBase}/`);
      process.exitCode = 1;
    } else {
      comparar(destino, vieja);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

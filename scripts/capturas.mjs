// Capturas de referencia para comparar la interfaz antes y después de un refactor.
//
//   pnpm build
//   pnpm capturas base                  # guarda capturas/base/
//   pnpm capturas fase-2 --base base    # guarda capturas/fase-2/ y la compara con capturas/base/
//
// Opciones: --estilos (guarda y compara los estilos computados de cada elemento), --build (corre `vite build` antes), --solo <texto> (solo pantallas cuyo nombre lo contenga),
// --puerto <n> (por defecto 4173), --movimiento y --bordes (ver abajo).
//
// Modo --movimiento: lo mismo pero SIN prefers-reduced-motion, para comprobar que las animaciones
// siguen presentes tras tocar el CSS. El reloj es falso (se avanza a mano) y las animaciones CSS se
// congelan en un instante fijo con la API de animaciones web; además se guarda en _animaciones.json
// qué animaciones estaban activas en cada pantalla y la comparación también las contrasta.
//   pnpm capturas mov-base --movimiento
//   pnpm capturas mov-fase-2 --movimiento --base mov-base
//
// Para que dos corridas sean idénticas se fija todo lo que cambia solo: reloj (2026-06-15 10:30),
// Math.random (generador con semilla), zona horaria, movimiento reducido (sin animaciones ni
// máquina de escribir) y el contenido de localStorage, que se reescribe en cada carga.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import zlib from "node:zlib";
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
const MOVIMIENTO = args.includes("--movimiento");
const BORDES = args.includes("--bordes");
const ESTILOS = args.includes("--estilos");
const INSTANTE_ANIMACION = 650; // ms en los que se congelan las animaciones CSS en modo --movimiento
// ms que avanza el reloj pausado: tras cargar (máquina de escribir y secuencias del hada) y tras los pasos de cada
// pantalla. Son 500 y 150 más que cuando el reloj corría solo: ese tiempo real "de regalo" es el que fijaba los
// fotogramas de la base (mov-base), así que se pide de forma explícita para que no cambie.
const AVANCE_INICIAL = 6500;
const AVANCE_TRAS_PASOS = 650;
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
  // a un acierto de subir de nivel (para ver la animación de level-up)
  peCasiNivel: () => ({
    "grimorio-perfil-v1": PERFIL,
    "grimorio-materia-activa": "PE",
    "guia-pe-progreso-v1": { ...PROGRESO_PE, xp: 295 },
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

// Responde el reactivo que está en pantalla. Las opciones salen barajadas, así que se busca el reactivo
// por su enunciado y sus opciones para saber cuál tecla es la correcta (o una incorrecta).
async function responderReactivo(page, bien) {
  const enunciado = await page.locator("h2.pregunta").textContent();
  const textos = await page.locator(".opcion .op-texto").allTextContents();
  const reactivo = PREGUNTAS_PE.find(
    (p) => p.pregunta === enunciado && [...p.opciones].sort().join("\u0000") === [...textos].sort().join("\u0000"),
  );
  if (!reactivo) throw new Error(`No encontré el reactivo "${enunciado}"`);
  const correcta = textos.indexOf(reactivo.opciones[reactivo.correcta]);
  const indice = bien ? correcta : (correcta + 1) % textos.length;
  await page.keyboard.press(String(indice + 1));
}

const practicarTema1 = async (page) => {
  await page.getByRole("tab", { name: "Practicar" }).click();
};

// Pantallas del modo --movimiento: una por cada animación viva (paisaje, ▼ del diálogo, +XP,
// level-up, trofeo) en los estados que las disparan.
const PANTALLAS_MOVIMIENTO = [
  { nombre: "inicio-pe", escenario: "pe", hash: "/" },
  {
    nombre: "tema-acierto",
    escenario: "pe",
    hash: "/tema/1",
    pasos: async (page) => {
      await practicarTema1(page);
      await responderReactivo(page, true);
    },
  },
  {
    nombre: "tema-fallo",
    escenario: "pe",
    hash: "/tema/1",
    pasos: async (page) => {
      await practicarTema1(page);
      await responderReactivo(page, false);
    },
  },
  {
    nombre: "tema-subir-nivel",
    escenario: "peCasiNivel",
    hash: "/tema/1",
    pasos: async (page) => {
      await practicarTema1(page);
      await responderReactivo(page, true);
    },
  },
  {
    // tema completo sin fallar: aparece el trofeo con la animación "festejo"
    nombre: "tema-dominado",
    escenario: "pe",
    hash: "/tema/1",
    pasos: async (page) => {
      await practicarTema1(page);
      for (let k = 0; k < reactivosTema1; k++) {
        await responderReactivo(page, true);
        await page.keyboard.press("Enter");
      }
    },
  },
  PANTALLAS.find((p) => p.nombre === "simulacro-resultados"),
];

const TODOS_LOS_VIEWPORTS = [
  { nombre: "1440x900", width: 1440, height: 900 },
  { nombre: "820x1180", width: 820, height: 1180 },
  { nombre: "390x844", width: 390, height: 844 },
];
// Modo --bordes: pantallas clave (Inicio, práctica de un tema, simulacro y elegir hada) en anchos y altos justo a
// ambos lados de cada corte de los @media, para comprobar que reorganizar o unificar el CSS no mueve ninguno.
//   pnpm capturas bordes-base --bordes
//   pnpm capturas bordes-nuevo --bordes --base bordes-base
const PANTALLAS_BORDES = ["inicio-pe", "tema-practica", "simulacro-jugando", "elegir-hada"];
const borde = (width, height) => ({ nombre: `${width}x${height}`, width, height });
const VIEWPORTS_BORDES = [
  // cortes de ancho (max-width 420, 430, 600, 640, 900; min-width 601, 1100, 1500)
  ...[420, 421, 430, 431, 600, 601, 640, 641].map((w) => borde(w, 844)),
  ...[900, 901, 1099, 1100, 1499, 1500].map((w) => borde(w, 800)),
  // corte de alto (max-height 700): celular vertical y horizontal
  borde(390, 700), borde(390, 701), borde(740, 700), borde(740, 701),
  // corte de proporción (aspect-ratio 4/3) con la misma anchura
  borde(1200, 900), borde(1200, 901),
];

// en modo --movimiento solo laptop y celular
const VIEWPORTS = BORDES ? VIEWPORTS_BORDES : MOVIMIENTO ? TODOS_LOS_VIEWPORTS.filter((v) => v.width !== 820) : TODOS_LOS_VIEWPORTS;
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

// `avance` (ms) solo se usa en modo --movimiento: cuánto adelanta el reloj falso para que terminen la
// máquina de escribir de los diálogos y las secuencias de animación del hada.
async function estabilizar(page, avance = 0) {
  if (MOVIMIENTO) {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    await page.clock.runFor(avance);
    await page.waitForTimeout(150); // deja que React pinte lo que dispararon los temporizadores
    return;
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete));
  await page.waitForTimeout(350); // deja que Escena calcule su escala con ResizeObserver
}

// Modo --movimiento: las animaciones CSS nacen en pausa (y sin transiciones), así que no dependen del
// tiempo real; al final cada una se coloca en un instante fijo. Devuelve los nombres de las que había.
const PAUSAR_ANIMACIONES = "*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }";

async function congelarAnimaciones(page, instante) {
  return page.evaluate((t) => {
    const nombres = new Set();
    for (const a of document.getAnimations()) {
      const { iterations, endTime } = a.effect.getComputedTiming();
      if (a.animationName) nombres.add(a.animationName);
      a.pause();
      // las que se repiten, en `instante`; las que terminan, a la mitad (la de destello, casi al final: ya sin blanco)
      a.currentTime = iterations === Infinity ? t : endTime * (a.animationName === "level-flash" ? 0.9 : 0.5);
    }
    return [...nombres].sort();
  }, instante);
}

async function capturarPantalla(contexto, pantalla, vp, modo, destino, animaciones) {
  const almacen = ESCENARIOS[pantalla.escenario]();
  const page = await contexto.newPage();
  page.setDefaultTimeout(8000);
  try {
    await page.addInitScript(preparacion, { almacen, tema: modo === "oscuro" ? "dark" : "light" });
    const ruta = pantalla.hash === null ? enlaceImportar() : `/#${pantalla.hash}`;
    await page.goto(URL_APP + ruta, { waitUntil: MOVIMIENTO ? "load" : "networkidle" });
    if (MOVIMIENTO) await page.addStyleTag({ content: PAUSAR_ANIMACIONES });
    await estabilizar(page, AVANCE_INICIAL);
    if (pantalla.pasos) {
      await pantalla.pasos(page);
      await estabilizar(page, AVANCE_TRAS_PASOS);
    }
    const base = `${pantalla.nombre}__${vp.nombre}__${modo}`;
    if (MOVIMIENTO) animaciones[`${base}.png`] = await congelarAnimaciones(page, INSTANTE_ANIMACION);
    await page.screenshot({ path: path.join(destino, `${base}.png`) });
    if (ESTILOS) {
      fs.mkdirSync(path.join(destino, "_estilos"), { recursive: true });
      fs.writeFileSync(path.join(destino, "_estilos", `${base}.json.gz`), zlib.gzipSync(JSON.stringify(await leerEstilos(page))));
    }
    if (pantalla.fin && !MOVIMIENTO) {
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

// ───────── comparación de las animaciones activas (solo si ambas carpetas vienen de --movimiento)
function compararAnimaciones(carpetaNueva, carpetaVieja) {
  const leer = (c) => {
    const f = path.join(c, "_animaciones.json");
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  };
  const nuevas = leer(carpetaNueva);
  const viejas = leer(carpetaVieja);
  if (!nuevas || !viejas) return 0;
  const todas = new Set(Object.values(nuevas).flat());
  console.log(`\n  Animaciones CSS detectadas: ${[...todas].sort().join(", ")}`);
  let diferencias = 0;
  for (const archivo of Object.keys({ ...viejas, ...nuevas })) {
    const a = (viejas[archivo] ?? []).join(", ");
    const b = (nuevas[archivo] ?? []).join(", ");
    if (a !== b) {
      diferencias++;
      console.log(`    DISTINTO ${archivo.replace(".png", "")}\n      antes:  ${a || "(ninguna)"}\n      ahora:  ${b || "(ninguna)"}`);
    }
  }
  if (!diferencias) console.log("  Las animaciones activas por pantalla son las mismas que en la base.");
  return diferencias;
}

// ───────── estilos computados (modo --estilos): guarda, por pantalla, los estilos de TODOS los elementos y de sus
// ::before/::after. Detecta cambios que los píxeles no ven (hover, elementos fuera de pantalla, valores equivalentes).
async function leerEstilos(page) {
  return page.evaluate(() => {
    const salida = {};
    const ruta = (el) => {
      const partes = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const i = n.parentElement ? [...n.parentElement.children].indexOf(n) : 0;
        partes.unshift(`${n.tagName.toLowerCase()}[${i}]`);
      }
      return partes.join(">");
    };
    const volcar = (cs) => { let t = ""; for (const p of cs) t += `${p}:${cs.getPropertyValue(p)};`; return t; };
    for (const el of document.querySelectorAll("html, html *")) {
      if (["SCRIPT", "STYLE", "LINK", "META", "TITLE", "HEAD", "NOSCRIPT"].includes(el.tagName)) continue;
      salida[ruta(el)] = volcar(getComputedStyle(el));
      for (const pseudo of ["::before", "::after"]) {
        const cs = getComputedStyle(el, pseudo);
        if (cs.content !== "none" && cs.content !== "normal") salida[ruta(el) + pseudo] = volcar(cs);
      }
    }
    return salida;
  });
}

function compararEstilos(carpetaNueva, carpetaVieja) {
  const dirNuevo = path.join(carpetaNueva, "_estilos"), dirViejo = path.join(carpetaVieja, "_estilos");
  if (!fs.existsSync(dirNuevo) || !fs.existsSync(dirViejo)) return 0;
  const leer = (dir, f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString());
  const nombres = new Set([...fs.readdirSync(dirNuevo), ...fs.readdirSync(dirViejo)]);
  const ordenar = (t) => (t ?? "").split(";").sort().join(";");
  let pantallasDistintas = 0, elementosDistintos = 0;
  const ejemplos = [];
  for (const f of nombres) {
    const pantalla = f.replace(".json.gz", "");
    if (!fs.existsSync(path.join(dirNuevo, f)) || !fs.existsSync(path.join(dirViejo, f))) { pantallasDistintas++; ejemplos.push(`${pantalla}: solo en una de las dos`); continue; }
    const a = leer(dirViejo, f), b = leer(dirNuevo, f);
    let distinta = false;
    for (const el of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (a[el] === b[el] || ordenar(a[el]) === ordenar(b[el])) continue; // el orden de las propiedades no importa
      distinta = true; elementosDistintos++;
      if (ejemplos.length < 12) {
        const mapa = (t) => Object.fromEntries((t ?? "").split(";").filter(Boolean).map((x) => [x.slice(0, x.indexOf(":")), x.slice(x.indexOf(":") + 1)]));
        const ma = mapa(a[el]), mb = mapa(b[el]);
        const props = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].filter((p) => ma[p] !== mb[p]).slice(0, 4);
        ejemplos.push(`${pantalla}  ${el.split(">").slice(-3).join(">")}  ${props.map((p) => `${p}: ${ma[p]} → ${mb[p]}`).join(" | ")}`);
      }
    }
    if (distinta) pantallasDistintas++;
  }
  console.log(`\n  Estilos computados: pantallas distintas: ${pantallasDistintas}   elementos distintos: ${elementosDistintos}`);
  for (const e of ejemplos) console.log(`    ${e}`);
  return pantallasDistintas;
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
  const diferenciasAnimaciones = compararAnimaciones(carpetaNueva, carpetaVieja);
  const diferenciasEstilos = compararEstilos(carpetaNueva, carpetaVieja);
  return cambios.length + nuevasSinBase.length + viejas.size + diferenciasAnimaciones + diferenciasEstilos;
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
  const animaciones = {}; // archivo.png → nombres de las animaciones CSS activas (solo --movimiento)
  let total = 0;
  try {
    await esperar(URL_APP);
    const pantallas = (MOVIMIENTO ? PANTALLAS_MOVIMIENTO : PANTALLAS)
      .filter((p) => !BORDES || PANTALLAS_BORDES.includes(p.nombre))
      .filter((p) => !filtro || p.nombre.includes(filtro));
    for (const vp of VIEWPORTS) {
      for (const modo of MODOS) {
        const contexto = await navegador.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          locale: "es-MX",
          timezoneId: "America/Mexico_City",
          colorScheme: modo === "oscuro" ? "dark" : "light",
          reducedMotion: MOVIMIENTO ? "no-preference" : "reduce",
        });
        // con movimiento el reloj es falso y SE PAUSA: tras `install` seguiría corriendo en tiempo real, y los
        // milisegundos reales que tardan en montar la página se sumarían a la animación (el fotograma del hada al
        // capturar cambiaría de una corrida a otra). Pausado, solo avanza cuando el script lo manda.
        if (MOVIMIENTO) {
          await contexto.clock.install({ time: AHORA });
          await contexto.clock.pauseAt(new Date(AHORA.getTime() + 1000));
        } else await contexto.clock.setFixedTime(AHORA);
        for (const pantalla of pantallas) {
          try {
            await capturarPantalla(contexto, pantalla, vp, modo, destino, animaciones);
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

  if (MOVIMIENTO) fs.writeFileSync(path.join(destino, "_animaciones.json"), JSON.stringify(animaciones, null, 2));
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

// Pruebas de extremo a extremo con Playwright contra la build real (`vite preview`).
//
//   pnpm e2e                 # hace la build, levanta preview, corre las pruebas y apaga el servidor
//   pnpm e2e --sin-build     # reutiliza dist/ (más rápido; asegúrate de que está al día)
//   pnpm e2e --puerto 4300   # puerto de preview (por defecto 4199)
//
// Cada prueba usa su propio contexto de navegador (localStorage limpio). Sale con código 1 si alguna falla.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PREGUNTAS as PREGUNTAS_PE } from "../../src/data/preguntas.js";
import { PREGUNTAS as PREGUNTAS_FP } from "../../src/data/fp/preguntas.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const opcion = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const PUERTO = Number(opcion("puerto")) || 4199;
const URL_APP = `http://127.0.0.1:${PUERTO}`;
const VITE = path.join(RAIZ, "node_modules", "vite", "bin", "vite.js");

if (!args.includes("--sin-build")) {
  console.log("Construyendo (vite build)…");
  const b = spawnSync(process.execPath, [VITE, "build"], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
  if (b.status !== 0) { console.error("La build falló."); process.exit(1); }
}

async function esperar(url, intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    try { if ((await fetch(url)).ok) return; } catch { /* todavía no arranca */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en ${url}`);
}

// ───────── datos de prueba
const dia = (atras) => new Date(Date.now() - atras * 86_400_000).toISOString().slice(0, 10);
const idsPE = PREGUNTAS_PE.map((p) => p.id);
const idsFP = PREGUNTAS_FP.map((p) => p.id);
const mapa = (lista) => Object.fromEntries(lista.map((id, i) => [id, { intentos: 2 + (i % 3), aciertos: 1 + (i % 2), ultimo: i % 2 === 0 }]));
const sim = (cal, fecha) => ({ fecha, aciertos: Math.round(cal / 5), total: 20, calificacion: cal, porTema: { 1: { ok: 2, total: 3 } } });

const PERFIL_VIEJO = { nombre: "Daniela", avatar: "nova", hada: "nova" }; // formato de versiones anteriores
const PE = { xp: 235, preguntas: mapa(idsPE.slice(0, 30)), simulacros: [sim(60, "2026-05-01T18:20:00.000Z"), sim(85, "2026-05-02T19:05:00.000Z")], diasEstudio: [dia(2), dia(1), dia(0)] };
const FP = { xp: 80, preguntas: mapa(idsFP.slice(0, 12)), simulacros: [], diasEstudio: [dia(0)] };

// ───────── utilidades de página
let navegador;
const contexto = (opciones = {}) => navegador.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-MX", ...opciones });
const sembrar = (page, almacen) => page.evaluate((a) => { for (const [k, v] of Object.entries(a)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, almacen);
const leerAlmacen = (page, k) => page.evaluate((k) => { const v = localStorage.getItem(k); try { return JSON.parse(v); } catch { return v; } }, k);
const texto = (page) => page.locator("body").innerText();
const ir = async (page, hash) => { await page.goto(`${URL_APP}/#${hash}`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(400); };
// Abrir un enlace de importación como lo haría el usuario: pestaña nueva (carga completa). `goto` con otro
// hash en la misma página no recarga, y la ruta de importación se lee al cargar.
const abrirEnlace = async (page, enlace) => { await page.goto(enlace); await page.reload(); await page.waitForLoadState("networkidle"); await page.waitForTimeout(400); };
const conErrores = (page) => { const errs = []; page.on("pageerror", (e) => errs.push(e.message)); return errs; };
const ALMACEN_LLENO = () => {
  if (!localStorage.getItem("sembrado")) {
    localStorage.setItem("sembrado", "1");
    localStorage.setItem("grimorio-perfil-v1", JSON.stringify({ nombre: "Dani", avatar: "lyra" }));
    localStorage.setItem("grimorio-materia-activa", "PE");
  }
  Storage.prototype.setItem = function () { throw new DOMException("lleno", "QuotaExceededError"); };
};

// lo que el usuario ve: nivel, racha, nombre, hada y materia
async function instantanea(page) {
  await ir(page, "/");
  const inicio = await texto(page);
  const materia = await page.locator(".estado").innerText().then((t) => t.match(/\b(PE|FP)\b/)?.[1]);
  await ir(page, "/progreso");
  const prog = await texto(page);
  const hadas = await page.locator("img").evaluateAll((imgs) => [...new Set(imgs.map((i) => i.src.match(/hadas\/([a-z]+)/)?.[1]).filter(Boolean))]);
  return {
    nivelBarra: inicio.match(/LV\.\s*(\d+)/)?.[1],
    racha: inicio.match(/DAY:\s*(\d+)/)?.[1],
    materia,
    nombre: prog.match(/(\S+) · NIVEL/i)?.[1]?.toLowerCase(), // el CSS lo pone en mayúsculas
    nivelProgreso: prog.match(/NIVEL\s*(\d+)/i)?.[1],
    xpTexto: prog.match(/(\d+) XP en total/)?.[1],
    rachaTexto: prog.match(/racha de (\d+)/)?.[1],
    hadas,
  };
}

// ───────── pruebas
const resultados = [];
const paso = async (nombre, f) => {
  try { await f(); resultados.push(["OK   ", nombre]); }
  catch (e) { resultados.push(["FALLA", `${nombre}\n        ${String(e.message).split("\n").slice(0, 8).join("\n        ")}`]); }
};

async function correr() {
  // A. progreso real: recarga y todo igual
  let antes;
  const ctxA = await contexto();
  const pagA = await ctxA.newPage();
  const erroresA = conErrores(pagA);
  await pagA.goto(URL_APP);
  await sembrar(pagA, { "grimorio-perfil-v1": PERFIL_VIEJO, "grimorio-materia-activa": "PE", "guia-pe-progreso-v1": PE, "guia-fp-progreso-v1": FP, "guia-pe-tema": "dark" });
  await pagA.reload();
  await paso("A1 carga un progreso real: nivel 3, racha 3, perfil y materia correctos", async () => {
    antes = await instantanea(pagA);
    assert.deepEqual({ ...antes, hadas: undefined }, { nivelBarra: "03", racha: "03", materia: "PE", nombre: "daniela", nivelProgreso: "3", xpTexto: "235", rachaTexto: "3", hadas: undefined });
    assert.ok(antes.hadas.includes("nova"));
  });
  await paso("A2 tras recargar, nivel/racha/perfil/materia/tema siguen iguales", async () => {
    await pagA.reload();
    assert.deepEqual(await instantanea(pagA), antes);
    await pagA.reload();
    assert.equal(await pagA.evaluate(() => document.documentElement.dataset.theme), "dark");
  });
  await paso("A3 lo guardado conserva los datos y el perfil ya no lleva `hada`", async () => {
    assert.deepEqual(await leerAlmacen(pagA, "guia-pe-progreso-v1"), PE); // idéntico, incluso el orden de las claves
    assert.deepEqual(await leerAlmacen(pagA, "guia-fp-progreso-v1"), FP);
    await ir(pagA, "/hada");
    await pagA.getByRole("radio").nth(2).check({ force: true });
    await pagA.getByRole("button", { name: /LISTO/ }).click();
    assert.deepEqual(Object.keys(await leerAlmacen(pagA, "grimorio-perfil-v1")).sort(), ["avatar", "nombre"]);
  });
  await paso("A4 responder un reactivo guarda el progreso y sobrevive a la recarga", async () => {
    await ir(pagA, "/tema/1");
    await pagA.getByRole("tab", { name: "Practicar" }).click();
    await pagA.keyboard.press("1");
    await pagA.waitForTimeout(300);
    const guardado = await leerAlmacen(pagA, "guia-pe-progreso-v1");
    assert.ok(guardado.xp === 235 || guardado.xp === 245, `xp=${guardado.xp}`);
    await pagA.reload();
    assert.deepEqual(await leerAlmacen(pagA, "guia-pe-progreso-v1"), guardado);
  });
  const progresoParaEnlace = await leerAlmacen(pagA, "guia-pe-progreso-v1");
  const progresoFPEnlace = await leerAlmacen(pagA, "guia-fp-progreso-v1");
  const perfilParaEnlace = await leerAlmacen(pagA, "grimorio-perfil-v1");

  // B. transferencia
  let enlace;
  await paso("B1 genera un enlace de transferencia desde Logros", async () => {
    await ir(pagA, "/progreso");
    enlace = await pagA.locator(".enlace-copiable code").textContent();
    assert.match(enlace, /#\/importar\?d=/);
  });
  await paso("B2 importar en un perfil limpio (combinar) llega igual", async () => {
    const ctx = await contexto(); const p = await ctx.newPage();
    await abrirEnlace(p, enlace);
    assert.match(await texto(p), new RegExp(perfilParaEnlace.nombre, "i"));
    await p.getByRole("button", { name: "Combinar con lo de aquí" }).click();
    await p.waitForTimeout(300);
    assert.deepEqual(await leerAlmacen(p, "guia-pe-progreso-v1"), progresoParaEnlace);
    assert.deepEqual(await leerAlmacen(p, "guia-fp-progreso-v1"), progresoFPEnlace);
    assert.deepEqual(await leerAlmacen(p, "grimorio-perfil-v1"), perfilParaEnlace);
    await p.getByRole("button", { name: /ENTRAR/ }).click();
    await p.waitForTimeout(400);
    const vista = await instantanea(p);
    assert.equal(vista.nivelBarra, antes.nivelBarra); assert.equal(vista.racha, antes.racha);
    assert.equal(vista.nombre, antes.nombre); assert.equal(vista.materia, "PE");
    await p.reload();
    assert.deepEqual(await instantanea(p), vista);
    await ctx.close();
  });
  await paso("B3 importar REEMPLAZANDO sobre otro progreso deja exactamente lo entrante", async () => {
    const ctx = await contexto(); const p = await ctx.newPage();
    await p.goto(URL_APP);
    await sembrar(p, { "grimorio-perfil-v1": { nombre: "Otra", avatar: "onyx" }, "grimorio-materia-activa": "FP", "guia-pe-progreso-v1": { xp: 999, preguntas: mapa(idsPE.slice(40, 45)), simulacros: [sim(10, "2026-01-01T00:00:00.000Z")], diasEstudio: ["2026-01-01"] }, "guia-fp-progreso-v1": { xp: 5, preguntas: {}, simulacros: [], diasEstudio: [] } });
    await abrirEnlace(p, enlace);
    await p.getByRole("button", { name: "Reemplazar mi progreso actual" }).click();
    await p.getByRole("button", { name: "Sí, reemplazar" }).click();
    await p.waitForTimeout(300);
    assert.deepEqual(await leerAlmacen(p, "guia-pe-progreso-v1"), progresoParaEnlace);
    assert.deepEqual(await leerAlmacen(p, "guia-fp-progreso-v1"), progresoFPEnlace);
    assert.deepEqual(await leerAlmacen(p, "grimorio-perfil-v1"), perfilParaEnlace);
    await ctx.close();
  });
  await paso("B4 importar COMBINANDO con progreso local une datos (XP mayor, preguntas, simulacros, días)", async () => {
    const ctx = await contexto(); const p = await ctx.newPage();
    await p.goto(URL_APP);
    const local = { xp: 999, preguntas: mapa(idsPE.slice(40, 45)), simulacros: [sim(10, "2026-01-01T00:00:00.000Z")], diasEstudio: ["2026-01-01", dia(1)] };
    await sembrar(p, { "grimorio-perfil-v1": { nombre: "Otra", avatar: "onyx" }, "guia-pe-progreso-v1": local });
    await abrirEnlace(p, enlace);
    await p.getByRole("button", { name: "Combinar con lo de aquí" }).click();
    await p.waitForTimeout(300);
    const r = await leerAlmacen(p, "guia-pe-progreso-v1");
    assert.equal(r.xp, 999);
    assert.deepEqual(Object.keys(r.preguntas).sort(), [...new Set([...Object.keys(local.preguntas), ...Object.keys(progresoParaEnlace.preguntas)])].sort());
    assert.equal(r.simulacros.length, 1 + progresoParaEnlace.simulacros.length);
    assert.deepEqual(r.diasEstudio, [...new Set(["2026-01-01", dia(1), ...progresoParaEnlace.diasEstudio])].sort());
    assert.deepEqual(await leerAlmacen(p, "grimorio-perfil-v1"), perfilParaEnlace); // el perfil entrante sustituye al local
    await ctx.close();
  });

  // C. enlaces inválidos
  for (const [nombre, hash] of [["basura", "#/importar?d=basura"], ["sin parámetro", "#/importar"], ["gigante (1.5 MB)", `#/importar?d=${"A".repeat(1_500_000)}`]]) {
    await paso(`C enlace ${nombre} → pantalla "enlace no válido" sin tronar`, async () => {
      const ctx = await contexto(); const p = await ctx.newPage(); const errs = conErrores(p);
      await p.goto(`${URL_APP}/${hash}`); await p.waitForLoadState("load"); await p.waitForTimeout(500);
      assert.match(await texto(p), /Este enlace no es válido/);
      assert.deepEqual(errs, []);
      await ctx.close();
    });
  }

  // D. datos corruptos en localStorage
  await paso("D almacenamiento corrupto: la app abre y usa valores seguros", async () => {
    const ctx = await contexto(); const p = await ctx.newPage(); const errs = conErrores(p);
    await p.goto(URL_APP);
    await sembrar(p, {
      "grimorio-perfil-v1": { nombre: "N".repeat(10_000), avatar: "dragon" }, "grimorio-materia-activa": "XX",
      "guia-pe-progreso-v1": { xp: "250", preguntas: [1, 2], simulacros: "x", diasEstudio: "hoy" }, "guia-fp-progreso-v1": "{roto", "guia-pe-tema": "naranja",
    });
    await p.reload(); await p.waitForLoadState("networkidle"); await p.waitForTimeout(400);
    const t = await texto(p);
    assert.match(t, /Hola, N{32}\./); // pantalla de materias (la materia "XX" no existe) y nombre a 32
    assert.ok(!/N{33}/.test(t));
    await p.getByRole("button", { name: /ENTRAR/ }).click(); await p.waitForTimeout(400);
    assert.match(await texto(p), /LV\.\s*03/); // xp "250" → nivel 3
    assert.deepEqual(errs, []);
    await ctx.close();
  });

  // E. fallo al guardar
  await paso("E1 si localStorage no deja guardar: aviso accesible (role=status) y se puede cerrar", async () => {
    const ctx = await contexto(); const p = await ctx.newPage(); const errs = conErrores(p);
    await p.addInitScript(ALMACEN_LLENO);
    await p.goto(URL_APP); await p.waitForLoadState("networkidle"); await p.waitForTimeout(500);
    const region = p.locator(".aviso-guardado");
    assert.equal(await region.getAttribute("role"), "status");
    assert.equal(await region.getAttribute("aria-live"), "polite");
    assert.match(await region.innerText(), /No se pudo guardar/);
    await p.getByRole("button", { name: "Entendido" }).click();
    assert.equal((await region.innerText()).trim(), "");
    assert.deepEqual(errs, []);
    await ctx.close();
  });
  await paso("E2 el aviso también aparece en celular (390px)", async () => {
    const ctx = await contexto({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
    await p.addInitScript(ALMACEN_LLENO);
    await p.goto(URL_APP); await p.waitForTimeout(800);
    assert.match(await p.locator(".aviso-guardado").innerText(), /No se pudo guardar/);
    await ctx.close();
  });
  await paso("E3 si localStorage lanza hasta al leer (modo privado estricto): la app abre en la bienvenida", async () => {
    const ctx = await contexto(); const p = await ctx.newPage(); const errs = conErrores(p);
    await p.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("bloqueado", "SecurityError"); } }); });
    await p.goto(URL_APP); await p.waitForTimeout(800);
    assert.match(await texto(p), /Cómo te llamas/);
    assert.deepEqual(errs, []);
    await ctx.close();
  });

  // F. diálogos de confirmación: abrir, cancelar y confirmar, con ratón y solo con teclado.
  // Hoy el foco no se atrapa ni Escape cierra (pendiente de accesibilidad): se prueba lo que sí hace.
  // `activar` pone el foco en el botón y lo acciona con el teclado.
  const activar = async (p, boton, tecla = "Enter") => { await boton.focus(); await p.keyboard.press(tecla); await p.waitForTimeout(150); };
  const nuevaPagina = async (almacen) => {
    const ctx = await contexto(); const p = await ctx.newPage(); const errs = conErrores(p);
    await p.goto(URL_APP); await sembrar(p, almacen); await p.reload(); await p.waitForLoadState("networkidle"); await p.waitForTimeout(300);
    return { ctx, p, errs };
  };
  const SEMBRADO = { "grimorio-perfil-v1": { nombre: "Dani", avatar: "lyra" }, "grimorio-materia-activa": "PE", "guia-pe-progreso-v1": PE, "guia-fp-progreso-v1": FP };

  for (const modo of ["ratón", "teclado"]) {
    const pulsar = async (p, b, tecla) => (modo === "ratón" ? b.click() : activar(p, b, tecla));

    await paso(`F1 borrar progreso (${modo}): abre, cancela y confirma`, async () => {
      const { ctx, p, errs } = await nuevaPagina(SEMBRADO);
      await ir(p, "/progreso");
      const abrir = p.getByRole("button", { name: "Borrar progreso de PE" });
      const caja = p.locator(".confirmar");
      assert.equal(await caja.count(), 0);
      await pulsar(p, abrir, "Enter");
      assert.equal(await caja.count(), 1);
      assert.equal(await caja.getAttribute("role"), null); // este cuadro no es alertdialog
      assert.match(await caja.innerText(), /No se puede deshacer/);
      await pulsar(p, caja.getByRole("button", { name: "Cancelar" }), "Space");
      assert.equal(await caja.count(), 0);
      assert.deepEqual(await leerAlmacen(p, "guia-pe-progreso-v1"), PE); // cancelar no toca nada
      await pulsar(p, abrir, "Space");
      await pulsar(p, p.locator(".confirmar").getByRole("button", { name: "Sí, borrar" }), "Enter");
      assert.equal(await p.locator(".confirmar").count(), 0);
      assert.equal((await leerAlmacen(p, "guia-pe-progreso-v1")).xp, 0);
      assert.deepEqual(await leerAlmacen(p, "guia-fp-progreso-v1"), FP); // la otra materia se queda
      assert.deepEqual(errs, []);
      await ctx.close();
    });

    await paso(`F2 reemplazar al importar (${modo}): abre, cancela y confirma`, async () => {
      const { ctx, p, errs } = await nuevaPagina({ ...SEMBRADO, "guia-pe-progreso-v1": { xp: 999, preguntas: {}, simulacros: [], diasEstudio: [] } });
      await abrirEnlace(p, enlace);
      const abrir = p.getByRole("button", { name: "Reemplazar mi progreso actual" });
      const dialogo = p.getByRole("alertdialog", { name: "Confirmar reemplazo" });
      assert.equal(await dialogo.count(), 0);
      await pulsar(p, abrir, "Enter");
      assert.equal(await dialogo.count(), 1);
      assert.match(await dialogo.innerText(), /se borrará el progreso/);
      await pulsar(p, dialogo.getByRole("button", { name: "Cancelar" }), "Enter");
      assert.equal(await dialogo.count(), 0);
      assert.equal((await leerAlmacen(p, "guia-pe-progreso-v1")).xp, 999); // cancelar no toca nada
      await pulsar(p, abrir, "Space");
      await pulsar(p, dialogo.getByRole("button", { name: "Sí, reemplazar" }), "Space");
      await p.waitForTimeout(300);
      assert.deepEqual(await leerAlmacen(p, "guia-pe-progreso-v1"), progresoParaEnlace);
      assert.deepEqual(errs, []);
      await ctx.close();
    });

    await paso(`F3 terminar simulacro (${modo}): abre, sigue revisando y termina`, async () => {
      const { ctx, p, errs } = await nuevaPagina(SEMBRADO);
      await ir(p, "/simulacro");
      await pulsar(p, p.getByRole("button", { name: "Empezar simulacro" }), "Enter");
      const abrir = p.getByRole("button", { name: "Terminar simulacro" });
      const dialogo = p.getByRole("alertdialog", { name: "Confirmar" });
      assert.equal(await dialogo.count(), 0);
      await pulsar(p, abrir, "Enter");
      assert.equal(await dialogo.count(), 1);
      assert.match(await dialogo.innerText(), /sin responder/);
      assert.ok(await dialogo.locator(".acciones.centro").count());
      await pulsar(p, dialogo.getByRole("button", { name: "Seguir revisando" }), "Enter");
      assert.equal(await dialogo.count(), 0);
      assert.equal((await leerAlmacen(p, "guia-pe-progreso-v1")).simulacros.length, PE.simulacros.length);
      await pulsar(p, abrir, "Space");
      await pulsar(p, dialogo.getByRole("button", { name: "Terminar", exact: true }), "Enter");
      assert.equal((await leerAlmacen(p, "guia-pe-progreso-v1")).simulacros.length, PE.simulacros.length + 1);
      assert.equal(await dialogo.count(), 0);
      assert.deepEqual(errs, []);
      await ctx.close();
    });
  }

  await paso("F4 el orden de Tab dentro del diálogo es Cancelar → Confirmar", async () => {
    const { ctx, p } = await nuevaPagina(SEMBRADO);
    await ir(p, "/progreso");
    await p.getByRole("button", { name: "Borrar progreso de PE" }).click();
    await p.locator(".confirmar").getByRole("button", { name: "Cancelar" }).focus();
    await p.keyboard.press("Tab");
    assert.equal(await p.evaluate(() => document.activeElement.textContent), "Sí, borrar");
    await ctx.close();
  });

  await paso("A5 la página principal no produjo errores de JavaScript", async () => assert.deepEqual(erroresA, []));
}

// ───────── arranque y cierre (el servidor se apaga pase lo que pase)
const servidor = spawn(process.execPath, [VITE, "preview", "--port", String(PUERTO), "--strictPort", "--host", "127.0.0.1"], {
  cwd: RAIZ, env: { ...process.env, PORT: String(PUERTO) }, stdio: ["ignore", "ignore", "inherit"],
});
const apagar = () => { if (!servidor.killed) servidor.kill(); };
process.on("SIGINT", () => { apagar(); process.exit(130); });
process.on("SIGTERM", () => { apagar(); process.exit(143); });

let codigo = 1;
try {
  await esperar(URL_APP);
  navegador = await chromium.launch();
  await correr();
  for (const [estado, nombre] of resultados) console.log(`${estado}  ${nombre}`);
  const fallas = resultados.filter(([e]) => e.startsWith("FALLA")).length;
  console.log(`\n${resultados.length - fallas} de ${resultados.length} pruebas pasaron.`);
  codigo = fallas ? 1 : 0;
} catch (e) {
  console.error(e);
} finally {
  await navegador?.close();
  apagar();
}
process.exit(codigo);

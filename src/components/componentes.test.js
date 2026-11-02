import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Aparato from "./Aparato.jsx";
import BarraXP from "./BarraXP.jsx";
import Confirmar from "./Confirmar.jsx";
import CursorMenu from "./CursorMenu.jsx";
import Encabezado from "./Encabezado.jsx";
import FilaTema from "./FilaTema.jsx";
import Pips from "./Pips.jsx";
import Stat from "./Stat.jsx";
import ZonaEscena from "./ZonaEscena.jsx";

const html = (el) => renderToStaticMarkup(el);

// Cada `esperado` es el HTML que producía el JSX escrito a mano en las vistas ANTES de extraer el componente
// (tomado del volcado del navegador: mismas etiquetas, clases, atributos y orden de atributos).

describe("BarraXP", () => {
  it("la de Logros: etiqueta simple", () => {
    expect(html(h(BarraXP, { xpNivel: 35 }))).toBe('<div class="xp" aria-label="35 de 100 XP"><i style="width:35%"></i></div>');
  });
  it("la de la portada: etiqueta completada con el sufijo", () => {
    expect(html(h(BarraXP, { xpNivel: 0, sufijo: " para el siguiente nivel" })))
      .toBe('<div class="xp" aria-label="0 de 100 XP para el siguiente nivel"><i style="width:0%"></i></div>');
  });
});

describe("Pips", () => {
  const estados = ["ok", "mal", "nada"];
  it("fila con etiqueta (temas y logros)", () => {
    expect(html(h(Pips, { estados, etiqueta: "1 de 3 dominados" })))
      .toBe('<span class="pips" aria-label="1 de 3 dominados"><i class="ok"></i><i class="mal"></i><i class="nada"></i></span>');
  });
  it("la fila grande del reactivo no lleva aria-label", () => {
    expect(html(h(Pips, { estados: ["actual", "nada"], className: "grandes" })))
      .toBe('<span class="pips grandes"><i class="actual"></i><i class="nada"></i></span>');
  });
  it("sin estados, la fila queda vacía", () => {
    expect(html(h(Pips, { estados: [] }))).toBe('<span class="pips"></span>');
  });
});

describe("Confirmar", () => {
  const botones = { textoCancelar: "Cancelar", onCancelar() {}, textoConfirmar: "Sí", onConfirmar() {} };
  const msg = h("p", null, "¿Seguro?");

  it("alertdialog con aria-label y botones en .acciones (reemplazar al importar)", () => {
    expect(html(h(Confirmar, { etiqueta: "Confirmar reemplazo", ...botones }, msg)))
      .toBe('<div class="confirmar px" role="alertdialog" aria-label="Confirmar reemplazo"><p>¿Seguro?</p><div class="acciones"><button class="btn px">Cancelar</button><button class="btn px pink">Sí</button></div></div>');
  });
  it("centrado: .acciones centro (terminar simulacro)", () => {
    expect(html(h(Confirmar, { etiqueta: "Confirmar", centrado: true, ...botones }, msg)))
      .toBe('<div class="confirmar px" role="alertdialog" aria-label="Confirmar"><p>¿Seguro?</p><div class="acciones centro"><button class="btn px">Cancelar</button><button class="btn px pink">Sí</button></div></div>');
  });
  it("sin etiqueta no tiene rol ni aria-label, y respeta el orden de clases del botón (borrar progreso)", () => {
    expect(html(h(Confirmar, { ...botones, claseConfirmar: "btn pink px" }, msg)))
      .toBe('<div class="confirmar px"><p>¿Seguro?</p><div class="acciones"><button class="btn px">Cancelar</button><button class="btn pink px">Sí</button></div></div>');
  });
  it("los botones son <button> reales: se alcanzan con Tab y se activan con Enter o Espacio", () => {
    const m = html(h(Confirmar, { etiqueta: "x", ...botones }, msg));
    expect((m.match(/<button/g) ?? []).length).toBe(2);
    expect(m).not.toMatch(/tabindex|onkeydown/i);
  });
});

describe("Stat", () => {
  it("etiqueta, valor y nota, en ese orden", () => {
    expect(html(h(Stat, { etiqueta: "Último simulacro", valor: "—", nota: "Aún no haces ninguno" })))
      .toBe('<div class="stat px"><span class="stat-k">Último simulacro</span><span class="stat-v">—</span><span class="stat-s">Aún no haces ninguno</span></div>');
  });
  it("lo que va en medio (la barra) queda entre el valor y la nota", () => {
    expect(html(h(Stat, { etiqueta: "Nivel", valor: 3, nota: "35/100 XP" }, h(BarraXP, { xpNivel: 35 }))))
      .toBe('<div class="stat px"><span class="stat-k">Nivel</span><span class="stat-v">3</span><div class="xp" aria-label="35 de 100 XP"><i style="width:35%"></i></div><span class="stat-s">35/100 XP</span></div>');
  });
  it("el valor puede llevar un <small>", () => {
    expect(html(h(Stat, { etiqueta: "Dominados", valor: h("span", null, 20, h("small", null, "/60")), nota: "n" })))
      .toContain('<span class="stat-v"><span>20<small>/60</small></span></span>');
  });
});

describe("FilaTema", () => {
  const tema = { id: 4, corto: "Ciclos" };
  it("con onClick es un botón .barra-tema.link (logros)", () => {
    expect(html(h(FilaTema, { tema, conteo: "2/6", onClick() {} }, h(Pips, { estados: ["ok"], etiqueta: "2 de 6" }))))
      .toBe('<button class="barra-tema link"><span class="bt-nombre">4. Ciclos</span><span class="pips" aria-label="2 de 6"><i class="ok"></i></span><span class="bt-num">2/6</span></button>');
  });
  it("sin onClick es un div de solo lectura (resultados del simulacro)", () => {
    expect(html(h(FilaTema, { tema, conteo: "1/2" }, h("span", { className: "bt-barra" }))))
      .toBe('<div class="barra-tema"><span class="bt-nombre">4. Ciclos</span><span class="bt-barra"></span><span class="bt-num">1/2</span></div>');
  });
});

describe("Encabezado", () => {
  it("sobretítulo y título", () => {
    expect(html(h(Encabezado, { eyebrow: "Logros · PE", titulo: "Tu progreso" })))
      .toBe('<section class="intro"><p class="eyebrow">Logros · PE</p><h1>Tu progreso</h1></section>');
  });
  it("con párrafo introductorio como hijo", () => {
    expect(html(h(Encabezado, { eyebrow: "e", titulo: "t" }, h("p", { className: "lead" }, "texto"))))
      .toBe('<section class="intro"><p class="eyebrow">e</p><h1>t</h1><p class="lead">texto</p></section>');
  });
});

describe("ZonaEscena", () => {
  it("solo escena: un .escena-wrap con la escena y nada más", () => {
    const m = html(h(ZonaEscena, { hada: "lyra", dia: 3, compacto: true }));
    expect(m).toContain('<div class="escena-wrap"><div class="escena-oficial compacta ');
    expect(m).toContain('<span class="day-tag">DAY: 03</span>');
    expect(m).not.toContain("bocadillo");
    expect(m.endsWith("</div></div>")).toBe(true);
  });
  it("con diálogo: el bocadillo va después de la escena, con la clase bocadillo-escena", () => {
    const m = html(h(ZonaEscena, { hada: "riley", dialogo: "¡Hola!" }));
    expect(m.indexOf("escena-oficial")).toBeLessThan(m.indexOf("bocadillo px bocadillo-escena"));
    expect(m).toContain('<div class="bocadillo px bocadillo-escena" aria-live="polite">');
    expect(m).toContain("¡Hola!");
    expect(m.endsWith("</div></div>")).toBe(true);
  });
  it("pasa secuencia y el resto de props a la escena; sin día usa el 1", () => {
    const m = html(h(ZonaEscena, { hada: "nova", secuencia: "nivel" }));
    expect(m).toContain('<span class="day-tag">DAY: 01</span>');
    expect(m).toContain("/sprites/hadas/nova/nova_00_reposo.png");
  });
});

describe("CursorMenu", () => {
  it("flechita decorativa con la clase del menú", () => {
    expect(html(h(CursorMenu, { clase: "menu-cursor" }))).toBe('<span class="menu-cursor" aria-hidden="true">▶</span>');
    expect(html(h(CursorMenu, { clase: "tema-cursor" }))).toBe('<span class="tema-cursor" aria-hidden="true">▶</span>');
  });
});

describe("Aparato", () => {
  const barra = { nivel: 2, dominadas: 0, total: 60, tema: "light", onTema() {}, materia: "PE", onMateria() {} };
  const salida = (props) => renderToStaticMarkup(h(Aparato, { barra, ...props }, h("p", null, "hola")));
  it("dibuja barra, pantalla, navegación y pie, en ese orden, dentro de .aparato", () => {
    const s = salida({ id: "contenido" });
    expect(s.startsWith('<div class="aparato"><header class="estado">')).toBe(true);
    expect(s).toContain('<main class="pantalla" id="contenido"><p>hola</p></main><nav class="nav" aria-label="Secciones">');
    expect(s.endsWith('</nav></div><footer class="pie"><span aria-hidden="true">✦</span> tamagotchigirls 2026</footer>')).toBe(true);
    expect(s.match(/<header /g)).toHaveLength(1);
    expect(s.match(/<footer /g)).toHaveLength(1);
  });
  it("`sola` añade pantalla-sola y `bloqueada` desactiva la navegación", () => {
    const s = salida({ sola: true, bloqueada: true });
    expect(s).toContain('<main class="pantalla pantalla-sola">');
    expect(s.match(/<button class="nav-btn[^>]*disabled=""/g)).toHaveLength(4);
  });
  it("la superposición va antes de la barra", () => {
    expect(salida({ superposicion: h("div", { className: "level-up" }) })).toContain('<div class="aparato"><div class="level-up"></div><header');
  });
});

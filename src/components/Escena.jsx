import { useLayoutEffect, useRef, useState } from "react";
import { PAISAJE } from "../lib/dimensiones.js";
import { dosDigitos } from "../lib/formato.js";
import Hada, { normalizarHada } from "./Hada.jsx";

// Escala de la escena: cabe a lo ancho de su columna y deja espacio vertical para el resto de la
// pantalla. Se redondea hacia abajo a múltiplos de 1/8 (0.25 = 1x del paisaje original, 0.5 = 2x…)
// para que los pixeles se vean parejos.
const PASO = 0.125, MIN = 0.25, MAX = 1;
const DOS_COLUMNAS = "(min-width: 1100px) and (min-aspect-ratio: 4/3)";

function calcularEscala(el, compacto) {
  const columna = el.parentElement?.clientWidth || el.clientWidth || PAISAJE.ancho;
  const pantalla = el.closest(".pantalla");
  const alto = pantalla?.clientHeight || window.innerHeight;
  const anchas = window.matchMedia(DOS_COLUMNAS).matches;
  // en dos columnas la escena comparte columna solo con el diálogo; en una, con todo el contenido
  const maxAlto = anchas ? alto - 130 : alto * (compacto ? 0.3 : 0.48);
  let s = Math.min(MAX, columna / PAISAJE.ancho, maxAlto / PAISAJE.alto);
  // en pantallas chicas se afina el paso para aprovechar el ancho (en celular la diferencia no se nota)
  const paso = s >= 0.5 ? PASO : 1 / 64;
  s = Math.floor(s / paso) * paso;
  return Math.max(MIN, s);
}

export default function Escena({ hada: hadaSolicitada, secuencia = "reposo", compacto = false, dia = 1, className = "" }) {
  const hada = normalizarHada(hadaSolicitada);
  const ref = useRef(null);
  const [escala, setEscala] = useState(compacto ? 0.5 : 0.75);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setEscala(calcularEscala(el, compacto));
    medir();
    const ro = new ResizeObserver(medir);
    if (el.parentElement) ro.observe(el.parentElement);
    const pantalla = el.closest(".pantalla");
    if (pantalla) ro.observe(pantalla);
    window.addEventListener("resize", medir);
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); };
  }, [compacto]);

  return (
    <div
      ref={ref}
      className={`escena-oficial ${compacto ? "compacta" : ""} ${className}`}
      style={{ "--scene-scale": escala }}
      aria-hidden="true"
    >
      <div
        className="escena-lienzo"
        style={{ "--paisaje": `url("/sprites/paisajes/${hada}/${hada}_paisaje_tira_4x.png")` }}
      >
        <span className="day-tag">DAY: {dosDigitos(dia)}</span>
        <Hada nombre={hada} secuencia={secuencia} className="hada-en-escena" />
      </div>
    </div>
  );
}

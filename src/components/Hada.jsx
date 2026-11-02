import { useEffect, useMemo, useState } from "react";
import { useMovimientoReducido } from "../lib/movimiento.js";
import { HADA as TAMANO } from "../lib/dimensiones.js";

export const HADAS = [
  { id: "riley", nombre: "Riley", elemento: "tierra", paisaje: "Bosque de cristal" },
  { id: "lyra", nombre: "Lyra", elemento: "hielo", paisaje: "Glaciar de aurora" },
  { id: "vega", nombre: "Vega", elemento: "rayo", paisaje: "Picos de tormenta" },
  { id: "aura", nombre: "Aura", elemento: "tiempo", paisaje: "Ruinas del reloj" },
  { id: "nova", nombre: "Nova", elemento: "cosmos", paisaje: "Jardín cósmico" },
  { id: "onyx", nombre: "Onyx", elemento: "sombra", paisaje: "Bosque de sombras" },
];

// El id puede venir de localStorage o de un enlace de importación: si no existe, se usa riley.
export const normalizarHada = (id) => (HADAS.some((h) => h.id === id) ? id : "riley");

const ARCHIVOS = {
  reposo: "00_reposo",
  reposo_b: "01_reposo_b",
  poder: "02_poder",
  ataque: "03_ataque",
  especial: "04_especial",
  elegido: "05_elegido",
  dano_a: "06_dano_a",
  dano_b: "07_dano_b",
  apagado: "08_apagado",
};

const SECUENCIAS = {
  reposo: [["reposo", 450], ["reposo_b", 450]],
  seleccion_activa: [["elegido", 600], ["reposo_b", 450]],
  seleccion_inactiva: [["apagado", 0]],
  acierto: [["poder", 400], ["especial", 600], ["reposo", 300]],
  fallo: [["dano_a", 90], ["dano_b", 90], ["dano_a", 90], ["dano_b", 90], ["dano_a", 90], ["dano_b", 90], ["dano_a", 90], ["dano_b", 90], ["reposo", 300]],
  nivel: [["ataque", 500], ["especial", 700], ["reposo", 300]],
};

const ruta = (nombre, frame, doble = false) =>
  `/sprites/hadas/${nombre}/${nombre}_${ARCHIVOS[frame]}${doble ? "@2x" : ""}.png`;

export default function Hada({ nombre = "riley", secuencia = "reposo", className = "", alt = "", doble = false }) {
  const hada = normalizarHada(nombre);
  const reducido = useMovimientoReducido();
  const pasos = useMemo(() => SECUENCIAS[secuencia] || SECUENCIAS.reposo, [secuencia]);
  const [frame, setFrame] = useState("reposo");

  useEffect(() => {
    Object.keys(ARCHIVOS).forEach((f) => { const img = new Image(); img.src = ruta(hada, f, doble); });
  }, [hada, doble]);

  useEffect(() => {
    if (reducido) { setFrame("reposo"); return; }
    let cancelado = false;
    let timer;
    let indice = 0;
    let enReposo = false;
    const avanzar = () => {
      if (cancelado) return;
      const lista = enReposo ? SECUENCIAS.reposo : pasos;
      const [siguiente, duracion] = lista[indice];
      setFrame(siguiente);
      if (duracion === 0) return;
      timer = setTimeout(() => {
        indice++;
        if (indice >= lista.length) {
          indice = 0;
          if (!["reposo", "seleccion_activa"].includes(secuencia)) enReposo = true;
        }
        avanzar();
      }, duracion);
    };
    avanzar();
    return () => { cancelado = true; clearTimeout(timer); };
  }, [pasos, secuencia, hada, reducido]);

  return (
    <img
      className={`hada-img ${className}`}
      src={ruta(hada, frame, doble)}
      width={TAMANO.ancho * (doble ? 2 : 1)}
      height={TAMANO.alto * (doble ? 2 : 1)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable="false"
    />
  );
}

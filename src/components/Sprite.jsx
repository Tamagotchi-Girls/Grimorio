import { memo } from "react";
import { SPRITES, PALETA } from "../lib/sprites.js";

// Dibuja un sprite como SVG con píxeles nítidos. Une píxeles consecutivos del mismo color.
function Sprite({ nombre, escala = 4, className = "", titulo }) {
  const filas = SPRITES[nombre];
  if (!filas) return null;
  const w = Math.max(...filas.map(f => f.length));
  const h = filas.length;
  const rects = [];
  filas.forEach((fila, y) => {
    let x = 0;
    while (x < fila.length) {
      const ch = fila[x];
      if (ch === ".") { x++; continue; }
      let fin = x;
      while (fin < fila.length && fila[fin] === ch) fin++;
      rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={fin - x} height={1} fill={PALETA[ch]} />);
      x = fin;
    }
  });
  return (
    <svg
      className={"sprite " + className}
      width={w * escala}
      height={h * escala}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {rects}
    </svg>
  );
}
export default memo(Sprite);

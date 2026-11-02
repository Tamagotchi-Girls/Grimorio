import { useEffect, useState } from "react";
import Sprite from "./Sprite.jsx";
import { useMovimientoReducido } from "../lib/movimiento.js";

// Caja de diálogo con efecto de máquina de escribir.
export default function Bocadillo({ texto, className = "" }) {
  const reducido = useMovimientoReducido();
  const [n, setN] = useState(reducido ? texto.length : 0);
  useEffect(() => {
    if (reducido) { setN(texto.length); return; }
    setN(0);
    const id = setInterval(() => {
      setN(v => {
        if (v >= texto.length) { clearInterval(id); return v; }
        return v + 1;
      });
    }, 28);
    return () => clearInterval(id);
  }, [texto, reducido]);
  return (
    <div className={"bocadillo px " + className} aria-live="polite">
      <p>
        <span aria-hidden="true">{texto.slice(0, n)}</span>
        <span className="sr">{texto}</span>
        {n < texto.length
          ? <span className="cursor" aria-hidden="true">▌</span>
          : <span className="dialogo-fin" aria-hidden="true">▼</span>}
      </p>
      <Sprite nombre="corazon" escala={3} className="bocadillo-corazon" />
      <Sprite nombre="chispaRosa" escala={3} className="bocadillo-chispa" />
    </div>
  );
}

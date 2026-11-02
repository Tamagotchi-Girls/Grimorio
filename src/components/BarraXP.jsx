import { XP_POR_NIVEL } from "../lib/nivel.js";

// Barra de XP del nivel actual. `sufijo` completa el texto que leen los lectores de pantalla.
export default function BarraXP({ xpNivel, sufijo = "" }) {
  return (
    <div className="xp" aria-label={`${xpNivel} de ${XP_POR_NIVEL} XP${sufijo}`}>
      <i style={{ width: `${(xpNivel / XP_POR_NIVEL) * 100}%` }} />
    </div>
  );
}

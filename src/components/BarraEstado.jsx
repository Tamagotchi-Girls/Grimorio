import { useEffect, useState } from "react";
import { dosDigitos } from "../lib/formato.js";
import Sprite from "./Sprite.jsx";

export default function BarraEstado({ nivel, dominadas, total, modoColor, onModoColor, materia, onMateria }) {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const h = ahora.getHours();
  const hora = `${dosDigitos(((h + 11) % 12) + 1)}:${dosDigitos(ahora.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
  const pct = dominadas / total;
  const barras = Math.min(4, Math.ceil(pct * 4));
  return (
    <header className="estado">
      <span className="lv" title={`Nivel ${nivel}`}>LV. {dosDigitos(nivel)}</span>
      <Sprite nombre="corazon" escala={3} />
      <span className="fecha">{dosDigitos(ahora.getDate())}/{dosDigitos(ahora.getMonth() + 1)}</span>
      <span className="hora">{hora}</span>
      <button className="materia-status" onClick={onMateria} aria-label={`Materia activa ${materia}. Cambiar de materia`}>{materia}</button>
      <span className="bateria" title={`${dominadas} de ${total} reactivos dominados`} aria-label={`Batería de estudio: ${dominadas} de ${total} reactivos dominados`}>
        {[0, 1, 2, 3].map(i => <i key={i} className={i < barras ? "on" : ""} />)}
      </span>
      <button className="modo-color-btn" onClick={onModoColor} aria-label={modoColor === "dark" ? "Cambiar a modo día" : "Cambiar a modo noche"} title={modoColor === "dark" ? "Modo día" : "Modo noche"}>
        <Sprite nombre={modoColor === "dark" ? "sol" : "luna"} escala={3} />
      </button>
    </header>
  );
}

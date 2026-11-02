import { useEffect, useState } from "react";
import Sprite from "./Sprite.jsx";

const pad = n => String(n).padStart(2, "0");

export default function BarraEstado({ nivel, dominadas, total, tema, onTema, materia, onMateria }) {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const h = ahora.getHours();
  const hora = `${pad(((h + 11) % 12) + 1)}:${pad(ahora.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
  const pct = dominadas / total;
  const barras = Math.min(4, Math.ceil(pct * 4));
  return (
    <header className="estado">
      <span className="lv" title={`Nivel ${nivel}`}>LV. {pad(nivel)}</span>
      <Sprite nombre="corazon" escala={3} />
      <span className="fecha">{pad(ahora.getDate())}/{pad(ahora.getMonth() + 1)}</span>
      <span className="hora">{hora}</span>
      <button className="materia-status" onClick={onMateria} aria-label={`Materia activa ${materia}. Cambiar de materia`}>{materia}</button>
      <span className="bateria" title={`${dominadas} de ${total} reactivos dominados`} aria-label={`Batería de estudio: ${dominadas} de ${total} reactivos dominados`}>
        {[0, 1, 2, 3].map(i => <i key={i} className={i < barras ? "on" : ""} />)}
      </span>
      <button className="tema-btn" onClick={onTema} aria-label={tema === "dark" ? "Cambiar a modo día" : "Cambiar a modo noche"} title={tema === "dark" ? "Modo día" : "Modo noche"}>
        <Sprite nombre={tema === "dark" ? "sol" : "luna"} escala={3} />
      </button>
    </header>
  );
}

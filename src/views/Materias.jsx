import { useState } from "react";
import ZonaEscena from "../components/ZonaEscena.jsx";
import { MATERIAS } from "../data/materias.js";
import { dosDigitos } from "../lib/formato.js";
import { resumenMateria } from "../lib/progreso.js";

export default function Materias({ perfil, onElegir }) {
  const [seleccion, setSeleccion] = useState(MATERIAS[0].id);
  const mover = (e) => {
    const pos = MATERIAS.findIndex((m) => m.id === seleccion);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setSeleccion(MATERIAS[Math.min(pos + 1, MATERIAS.length - 1)].id); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setSeleccion(MATERIAS[Math.max(pos - 1, 0)].id); }
    if (e.key === "Enter") { e.preventDefault(); onElegir(seleccion); }
  };
  return (
    <div className="vista selector-materia">
      <ZonaEscena hada={perfil.avatar} dialogo={`Hola, ${perfil.nombre}. ¿Para qué departamental vas a estudiar?`} />
      <fieldset className="menu-materias" onKeyDown={mover}>
        <legend className="sr">Selecciona una materia</legend>
        {MATERIAS.map((m) => {
          const p = resumenMateria(m.id);
          return (
            <label className={`materia-menu px ${seleccion === m.id ? "seleccionada" : ""}`} key={m.id}>
              <input type="radio" name="materia" value={m.id} checked={seleccion === m.id} onChange={() => setSeleccion(m.id)} />
              <span className="menu-cursor" aria-hidden="true">▶</span>
              <span className="materia-menu-info">
                <strong>{m.nombre}</strong><small>{m.clave}</small>
                <span className="dominio-barra" aria-label={`${p.dominio}% de dominio`}><i style={{ width: `${p.dominio}%` }} /></span>
              </span>
              <span className="materia-nivel">LV. {dosDigitos(p.nivel)}<small>{p.dominio}%</small></span>
            </label>
          );
        })}
      </fieldset>
      <button className="btn grande pink px entrar-materia" onClick={() => onElegir(seleccion)}>ENTRAR ▶</button>
    </div>
  );
}

import { useState } from "react";
import Bocadillo from "../components/Bocadillo.jsx";
import Escena from "../components/Escena.jsx";
import { CONTENIDO } from "../data/contenido.js";

const leer = (id) => {
  try {
    const datos = JSON.parse(localStorage.getItem(id === "PE" ? "guia-pe-progreso-v1" : "guia-fp-progreso-v1") || "{}");
    const xp = datos.xp || 0;
    const preguntas = CONTENIDO[id].PREGUNTAS;
    const dominadas = preguntas.filter((p) => datos.preguntas?.[p.id]?.ultimo).length;
    return { nivel: 1 + Math.floor(xp / 100), dominio: Math.round((dominadas / preguntas.length) * 100) };
  } catch { return { nivel: 1, dominio: 0 }; }
};

const MATERIAS = [
  { id: "PE", nombre: "Programación Estructurada", clave: "IL352" },
  { id: "FP", nombre: "Fundamentos de Programación", clave: "Departamental" },
];

export default function Materias({ perfil, onElegir }) {
  const [seleccion, setSeleccion] = useState("PE");
  const mover = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setSeleccion("FP"); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setSeleccion("PE"); }
    if (e.key === "Enter") { e.preventDefault(); onElegir(seleccion); }
  };
  return (
    <div className="vista selector-materia">
      <div className="escena-wrap">
        <Escena hada={perfil.avatar} />
      <Bocadillo className="bocadillo-escena" texto={`Hola, ${perfil.nombre}. ¿Para qué departamental vas a estudiar?`} />
      </div>
      <fieldset className="menu-materias" onKeyDown={mover}>
        <legend className="sr">Selecciona una materia</legend>
        {MATERIAS.map((m) => {
          const p = leer(m.id);
          return (
            <label className={`materia-menu px ${seleccion === m.id ? "seleccionada" : ""}`} key={m.id}>
              <input type="radio" name="materia" value={m.id} checked={seleccion === m.id} onChange={() => setSeleccion(m.id)} />
              <span className="menu-cursor" aria-hidden="true">▶</span>
              <span className="materia-menu-info">
                <strong>{m.nombre}</strong><small>{m.clave}</small>
                <span className="dominio-barra" aria-label={`${p.dominio}% de dominio`}><i style={{ width: `${p.dominio}%` }} /></span>
              </span>
              <span className="materia-nivel">LV. {String(p.nivel).padStart(2, "0")}<small>{p.dominio}%</small></span>
            </label>
          );
        })}
      </fieldset>
      <button className="btn grande pink px entrar-materia" onClick={() => onElegir(seleccion)}>ENTRAR ▶</button>
    </div>
  );
}

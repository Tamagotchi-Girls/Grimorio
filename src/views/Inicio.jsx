import { useMemo } from "react";
import Escena from "../components/Escena.jsx";
import Bocadillo from "../components/Bocadillo.jsx";
import Sprite from "../components/Sprite.jsx";
import { PREGUNTAS, TEMAS } from "../data/contenido.js";
import { materiaPorId } from "../data/materias.js";
import { textoCaminoSimulacro, textoCaminoTemas, textoResumenMateria, textoTemasCompletos } from "../lib/conteos.js";
import { XP_POR_NIVEL } from "../lib/nivel.js";

const FRASES = [
  "Que la magia de tus apuntadores nunca apunte a NULL.",
  "Un tema a la vez. Cada repaso cuenta.",
  "Cada string termina en '\\0'... pero tu aprendizaje no.",
  "Sin caso base no hay recursión. Sin repaso no hay examen. ¡A estudiar!",
  "Lee el código despacio, línea por línea. Ahí está la respuesta."
];

export default function Inicio({ prog, ir, perfil, materia, onMateria }) {
  const h = new Date().getHours();
  const saludo = h < 12 ? "¡Buenos días!" : h < 19 ? "¡Buenas tardes!" : "¡Buenas noches!";
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const temasDominados = TEMAS.filter(t => prog.resumenTema(t.id).completo).length;
  const ultimo = prog.datos.simulacros.at(-1);

  return (
    <div className="vista">
      <div className="escena-wrap">
        <Escena hada={perfil.avatar} dia={prog.racha} />
        <Bocadillo texto={`${saludo}, ${perfil.nombre}. ${frase}`} className="bocadillo-escena" />
      </div>

      <section className="intro">
        <p className="eyebrow">{materiaPorId(materia)?.etiqueta}</p>
        <h1>Guía de estudio para el departamental</h1>
        <p className="lead">{textoResumenMateria(TEMAS, PREGUNTAS)} Repasa con apuntes, practica por tema y haz simulacros. Tu progreso se guarda en este dispositivo.</p>
      </section>
      <div className="atajos-perfil">
        <button className="btn-texto cambiar-materia" onClick={onMateria}>← Cambiar de materia</button>
        <button className="btn-texto cambiar-hada" onClick={() => ir("hada")}>✦ Cambiar de hada</button>
      </div>

      <div className="caminos">
        <button className="camino px pink" onClick={() => ir("temas")}>
          <Sprite nombre="libro" escala={5} />
          <span>
            <b>Repasar por tema</b>
            <small>{textoCaminoTemas(TEMAS, PREGUNTAS)}</small>
          </span>
        </button>
        <button className="camino px mint" onClick={() => ir("simulacro")}>
          <Sprite nombre="corazon" escala={5} />
          <span>
            <b>Simulacro de examen</b>
            <small>{textoCaminoSimulacro(TEMAS)}</small>
          </span>
        </button>
      </div>

      <section className="stats">
        <div className="stat px">
          <span className="stat-k">Nivel</span>
          <span className="stat-v">{prog.nivel}</span>
          <div className="xp" aria-label={`${prog.xpNivel} de ${XP_POR_NIVEL} XP para el siguiente nivel`}>
            <i style={{ width: `${(prog.xpNivel / XP_POR_NIVEL) * 100}%` }} />
          </div>
          <span className="stat-s">{prog.xpNivel}/{XP_POR_NIVEL} XP</span>
        </div>
        <div className="stat px">
          <span className="stat-k">Dominados</span>
          <span className="stat-v">{prog.dominadas}<small>/{PREGUNTAS.length}</small></span>
          <span className="stat-s">{textoTemasCompletos(temasDominados, TEMAS)}</span>
        </div>
        <div className="stat px">
          <span className="stat-k">Último simulacro</span>
          <span className="stat-v">{ultimo ? ultimo.calificacion : "—"}</span>
          <span className="stat-s">{ultimo ? `${ultimo.aciertos} de ${ultimo.total} aciertos` : "Aún no haces ninguno"}</span>
        </div>
      </section>
    </div>
  );
}

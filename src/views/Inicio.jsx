import { useMemo, useState } from "react";
import BarraXP from "../components/BarraXP.jsx";
import Encabezado from "../components/Encabezado.jsx";
import Sprite from "../components/Sprite.jsx";
import Stat from "../components/Stat.jsx";
import ZonaEscena from "../components/ZonaEscena.jsx";
import { useContenido } from "../data/ContenidoContext.jsx";
import { materiaPorId } from "../data/materias.js";
import { textoCaminoSimulacro, textoCaminoTemas, textoResumenMateria, textoTemasCompletos } from "../lib/conteos.js";
import { XP_POR_NIVEL } from "../lib/nivel.js";
import { saludoSegunHora } from "../lib/saludo.js";

const FRASES = [
  "Que la magia de tus apuntadores nunca apunte a NULL.",
  "Un tema a la vez. Cada repaso cuenta.",
  "Cada string termina en '\\0'... pero tu aprendizaje no.",
  "Sin caso base no hay recursión. Sin repaso no hay examen. ¡A estudiar!",
  "Lee el código despacio, línea por línea. Ahí está la respuesta."
];

export default function Inicio({ prog, ir, perfil, materia, onMateria }) {
  const { TEMAS, PREGUNTAS } = useContenido();
  // la hora se lee una vez, al abrir la pantalla (no en cada render)
  const [saludo] = useState(() => saludoSegunHora(new Date()));
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const temasDominados = TEMAS.filter(t => prog.resumenTema(t.id).completo).length;
  const ultimo = prog.datos.simulacros.at(-1);

  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={prog.racha} dialogo={`${saludo}, ${perfil.nombre}. ${frase}`} />

      <Encabezado eyebrow={materiaPorId(materia)?.etiqueta} titulo="Guía de estudio para el departamental">
        <p className="lead">{textoResumenMateria(TEMAS, PREGUNTAS)} Repasa con apuntes, practica por tema y haz simulacros. Tu progreso se guarda en este dispositivo.</p>
      </Encabezado>
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
        <Stat etiqueta="Nivel" valor={prog.nivel} nota={`${prog.xpNivel}/${XP_POR_NIVEL} XP`}>
          <BarraXP xpNivel={prog.xpNivel} sufijo=" para el siguiente nivel" />
        </Stat>
        <Stat etiqueta="Dominados" valor={<>{prog.dominadas}<small>/{PREGUNTAS.length}</small></>} nota={textoTemasCompletos(temasDominados, TEMAS)} />
        <Stat
          etiqueta="Último simulacro"
          valor={ultimo ? ultimo.calificacion : "—"}
          nota={ultimo ? `${ultimo.aciertos} de ${ultimo.total} aciertos` : "Aún no haces ninguno"}
        />
      </section>
    </div>
  );
}

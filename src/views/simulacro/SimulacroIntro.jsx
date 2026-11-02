import { useContenido } from "../../data/ContenidoContext.jsx";
import { textoReglaSimulacro } from "../../lib/conteos.js";
import Sprite from "../../components/Sprite.jsx";
import ZonaEscena from "../../components/ZonaEscena.jsx";
import Encabezado from "../../components/Encabezado.jsx";

const mejorCalificacion = (simulacros) => Math.max(...simulacros.map((s) => s.calificacion));

export default function SimulacroIntro({ perfil, racha, simulacros, onEmpezar }) {
  const { TEMAS } = useContenido();
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={racha} />
      <Encabezado eyebrow="Simulacro de examen" titulo="¿Lista la varita? Es hora del simulacro" />
      <section className="reglas px">
        <ul>
          <li><Sprite nombre="chispaRosa" escala={3} />{textoReglaSimulacro(TEMAS)}</li>
          <li><Sprite nombre="chispaRosa" escala={3} />No verás si acertaste hasta terminar, como en el examen real.</li>
          <li><Sprite nombre="chispaRosa" escala={3} />Puedes moverte entre preguntas y marcar las que quieras revisar.</li>
          <li><Sprite nombre="chispaRosa" escala={3} />Cada simulacro sale distinto, con las opciones en otro orden.</li>
        </ul>
        <button className="btn grande px pink" onClick={onEmpezar}>Empezar simulacro</button>
      </section>
      {simulacros.length > 0 && (
        <p className="nota">Llevas {simulacros.length} simulacro{simulacros.length === 1 ? "" : "s"}. Mejor calificación: {mejorCalificacion(simulacros)}.</p>
      )}
    </div>
  );
}

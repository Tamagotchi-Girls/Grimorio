import FilaTema from "../../components/FilaTema.jsx";
import Reactivo from "../../components/Reactivo.jsx";
import Sprite from "../../components/Sprite.jsx";
import ZonaEscena from "../../components/ZonaEscena.jsx";
import { useContenido } from "../../data/ContenidoContext.jsx";
import { medallaDeSimulacro } from "../../lib/medallas.js";
import { XP_POR_ACIERTO } from "../../lib/nivel.js";
import { temasFlojos } from "../../lib/simulacro.js";

const claseBarra = ({ ok, total }) => (ok === total ? "ok" : ok === 0 ? "mal" : "");

export default function SimulacroResultados({ resultado, reactivos, respuestas, perfil, racha, ir, onOtro }) {
  const { TEMAS } = useContenido();
  const flojos = temasFlojos(TEMAS, resultado.porTema);
  const medalla = medallaDeSimulacro(resultado.calificacion);
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={racha} secuencia="nivel" compacto />
      <section className="final px">
        <Sprite nombre={medalla} escala={7} className={medalla === "copa" ? "festejo" : ""} />
        <p className="eyebrow">Tu calificación</p>
        <h2 className="calif">{resultado.calificacion}</h2>
        <p>{resultado.aciertos} de {resultado.total} aciertos · +{resultado.aciertos * XP_POR_ACIERTO} XP</p>
      </section>

      <section className="por-tema px">
        <h2 className="sub">Aciertos por tema</h2>
        {TEMAS.map(t => {
          const pt = resultado.porTema[t.id];
          if (!pt) return null;
          return (
            <FilaTema key={t.id} tema={t} conteo={`${pt.ok}/${pt.total}`}>
              <span className="bt-barra"><i style={{ width: `${(pt.ok / pt.total) * 100}%` }} className={claseBarra(pt)} /></span>
            </FilaTema>
          );
        })}
        {flojos.length > 0 && (
          <div className="reforzar">
            <b>Temas para reforzar:</b>
            <div className="chips">
              {flojos.map(t => <button key={t.id} className="chip px" onClick={() => ir(`tema/${t.id}`)}>{t.corto} →</button>)}
            </div>
          </div>
        )}
      </section>

      <div className="acciones centro">
        <button className="btn grande px pink" onClick={onOtro}>Hacer otro simulacro</button>
      </div>

      <h2 className="sub revision-titulo">Revisión</h2>
      <div className="revision">
        {reactivos.map((r, k) => (
          <article key={k} className="rev px">
            <p className="rev-num">Pregunta {k + 1}</p>
            <Reactivo reactivo={r} seleccion={respuestas[k]} onElegir={() => {}} revelar mostrarTema />
          </article>
        ))}
      </div>
    </div>
  );
}

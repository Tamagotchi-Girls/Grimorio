import { TEMAS } from "../data/contenido.js";
import Escena from "../components/Escena.jsx";
import { dosDigitos } from "../lib/formato.js";

export default function Temas({ prog, ir, perfil }) {
  return (
    <div className="vista">
      <div className="escena-wrap">
        <Escena hada={perfil.avatar} dia={prog.racha} compacto />
      </div>
      <section className="intro">
        <p className="eyebrow">Repaso por tema</p>
        <h1>Elige un tema</h1>
        <p className="lead">Cada cuadrito es un reactivo: verde si lo respondiste bien la última vez, rosa si falló, vacío si no lo has intentado.</p>
      </section>
      <div className="temas-grid">
        {TEMAS.map(t => {
          const est = prog.estadoTema(t.id);
          const { ok, total, completo } = prog.resumenTema(t.id);
          return (
            <button key={t.id} className={`tema-card px ${completo ? "completo" : ""}`} onClick={() => ir(`tema/${t.id}`)}>
              <span className="tema-cursor" aria-hidden="true">▶</span>
              <span className="tema-num">{dosDigitos(t.id)}</span>
              <span className="tema-info">
                <b>{t.nombre}</b>
                <span className="pips" aria-label={`${ok} de ${total} dominados`}>
                  {est.map((e, i) => <i key={i} className={e} />)}
                </span>
              </span>
              <span className="tema-ok">{ok}/{total}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

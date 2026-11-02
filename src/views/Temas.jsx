import { TEMAS } from "../data/contenido.js";
import Paisaje from "../components/Paisaje.jsx";

export default function Temas({ prog, ir, perfil }) {
  return (
    <div className="vista">
      <div className="escena-wrap">
        <Paisaje avatar={perfil.avatar} dia={prog.racha} compacto />
      </div>
      <section className="intro">
        <p className="eyebrow">Repaso por tema</p>
        <h1>Elige un tema</h1>
        <p className="lead">Cada cuadrito es un reactivo: verde si lo respondiste bien la última vez, rosa si falló, vacío si no lo has intentado.</p>
      </section>
      <div className="temas-grid">
        {TEMAS.map(t => {
          const est = prog.estadoTema(t.id);
          const ok = est.filter(e => e === "ok").length;
          return (
            <button key={t.id} className={`tema-card px ${ok === est.length ? "completo" : ""}`} onClick={() => ir(`tema/${t.id}`)}>
              <span className="tema-cursor" aria-hidden="true">▶</span>
              <span className="tema-num">{String(t.id).padStart(2, "0")}</span>
              <span className="tema-info">
                <b>{t.nombre}</b>
                <span className="pips" aria-label={`${ok} de ${est.length} dominados`}>
                  {est.map((e, i) => <i key={i} className={e} />)}
                </span>
              </span>
              <span className="tema-ok">{ok}/{est.length}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

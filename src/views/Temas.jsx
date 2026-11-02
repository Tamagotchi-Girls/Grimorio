import { TEMAS } from "../data/contenido.js";
import ZonaEscena from "../components/ZonaEscena.jsx";
import Encabezado from "../components/Encabezado.jsx";
import CursorMenu from "../components/CursorMenu.jsx";
import Pips from "../components/Pips.jsx";
import { dosDigitos } from "../lib/formato.js";

export default function Temas({ prog, ir, perfil }) {
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={prog.racha} compacto />
      <Encabezado eyebrow="Repaso por tema" titulo="Elige un tema">
        <p className="lead">Cada cuadrito es un reactivo: verde si lo respondiste bien la última vez, rosa si falló, vacío si no lo has intentado.</p>
      </Encabezado>
      <div className="temas-grid">
        {TEMAS.map(t => {
          const { ok, total, completo } = prog.resumenTema(t.id);
          return (
            <button key={t.id} className={`tema-card px ${completo ? "completo" : ""}`} onClick={() => ir(`tema/${t.id}`)}>
              <CursorMenu clase="tema-cursor" />
              <span className="tema-num">{dosDigitos(t.id)}</span>
              <span className="tema-info">
                <b>{t.nombre}</b>
                <Pips estados={prog.estadoTema(t.id)} etiqueta={`${ok} de ${total} dominados`} />
              </span>
              <span className="tema-ok">{ok}/{total}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

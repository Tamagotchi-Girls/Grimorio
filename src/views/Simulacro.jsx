import { useEffect, useState } from "react";
import { PREGUNTAS, TEMAS } from "../data/contenido.js";
import { barajar, prepararReactivo } from "../lib/progreso.js";
import { XP_POR_ACIERTO } from "../lib/nivel.js";
import { medallaDeSimulacro } from "../lib/medallas.js";
import { reactivosPorTemaEnSimulacro, textoReglaSimulacro } from "../lib/conteos.js";
import { indiceDeTecla } from "../lib/teclado.js";
import Reactivo from "../components/Reactivo.jsx";
import Sprite from "../components/Sprite.jsx";
import ZonaEscena from "../components/ZonaEscena.jsx";
import Encabezado from "../components/Encabezado.jsx";
import Confirmar from "../components/Confirmar.jsx";
import FilaTema from "../components/FilaTema.jsx";

function nuevoSimulacro() {
  // los mismos reactivos de cada tema, para que el examen cubra todos los temas, en orden aleatorio.
  const elegidos = TEMAS.flatMap(t => barajar(PREGUNTAS.filter(p => p.tema === t.id)).slice(0, reactivosPorTemaEnSimulacro(TEMAS)));
  return barajar(elegidos).map(prepararReactivo);
}

export default function Simulacro({ prog, ir, perfil }) {
  const [fase, setFase] = useState("intro");
  const [reactivos, setReactivos] = useState([]);
  const [resp, setResp] = useState({});
  const [marcadas, setMarcadas] = useState({});
  const [i, setI] = useState(0);
  const [confirmar, setConfirmar] = useState(false);
  const [resultado, setResultado] = useState(null);

  const empezar = () => {
    setReactivos(nuevoSimulacro());
    setResp({}); setMarcadas({}); setI(0); setConfirmar(false); setResultado(null);
    setFase("jugando");
  };

  const contestadas = Object.keys(resp).length;

  const terminar = () => {
    let aciertos = 0;
    const porTema = {};
    reactivos.forEach((r, k) => {
      const ok = resp[k] !== undefined && r.opcionesBarajadas[resp[k]].correcta;
      if (ok) aciertos++;
      porTema[r.tema] = porTema[r.tema] || { ok: 0, total: 0 };
      porTema[r.tema].total++;
      if (ok) porTema[r.tema].ok++;
      if (resp[k] !== undefined) prog.registrar(r.id, ok);
    });
    const res = {
      fecha: new Date().toISOString(),
      aciertos,
      total: reactivos.length,
      calificacion: Math.round((aciertos / reactivos.length) * 100),
      porTema
    };
    prog.guardarSimulacro(res);
    setResultado(res);
    setFase("resultados");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (fase !== "jugando") return;
    const h = (e) => {
      const opcion = indiceDeTecla(e.key, reactivos[i].opciones.length);
      if (opcion !== null) { e.preventDefault(); setResp(r => ({ ...r, [i]: opcion })); }
      else if (e.key === "ArrowRight" && i < reactivos.length - 1) setI(i + 1);
      else if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fase, i, reactivos]);

  if (fase === "intro") {
    return (
      <div className="vista">
        <ZonaEscena hada={perfil.avatar} dia={prog.racha} />
        <Encabezado eyebrow="Simulacro de examen" titulo="¿Lista la varita? Es hora del simulacro" />
        <section className="reglas px">
          <ul>
            <li><Sprite nombre="chispaRosa" escala={3} />{textoReglaSimulacro(TEMAS)}</li>
            <li><Sprite nombre="chispaRosa" escala={3} />No verás si acertaste hasta terminar, como en el examen real.</li>
            <li><Sprite nombre="chispaRosa" escala={3} />Puedes moverte entre preguntas y marcar las que quieras revisar.</li>
            <li><Sprite nombre="chispaRosa" escala={3} />Cada simulacro sale distinto, con las opciones en otro orden.</li>
          </ul>
          <button className="btn grande px pink" onClick={empezar}>Empezar simulacro</button>
        </section>
        {prog.datos.simulacros.length > 0 && (
          <p className="nota">Llevas {prog.datos.simulacros.length} simulacro{prog.datos.simulacros.length === 1 ? "" : "s"}. Mejor calificación: {Math.max(...prog.datos.simulacros.map(s => s.calificacion))}.</p>
        )}
      </div>
    );
  }

  if (fase === "jugando") {
    const r = reactivos[i];
    return (
      <div className="vista">
        <ZonaEscena hada={perfil.avatar} dia={prog.racha} compacto />
        <div className="sim-cabeza">
          <span className="eyebrow exam-pregunta">PREGUNTA {i + 1}/{reactivos.length} · {contestadas} respondidas</span>
          <button className={`marcar px ${marcadas[i] ? "on" : ""}`} onClick={() => setMarcadas(m => ({ ...m, [i]: !m[i] }))} aria-pressed={!!marcadas[i]}>
            <Sprite nombre="bandera" escala={3} /> {marcadas[i] ? "Marcada" : "Marcar para revisar"}
          </button>
        </div>
        <div className="mapa" aria-label="Ir a la pregunta">
          {reactivos.map((_, k) => (
            <button
              key={k}
              className={`celda ${k === i ? "actual" : ""} ${resp[k] !== undefined ? "resp" : ""} ${marcadas[k] ? "marc" : ""}`}
              onClick={() => setI(k)}
              aria-label={`Pregunta ${k + 1}${resp[k] !== undefined ? ", respondida" : ""}${marcadas[k] ? ", marcada" : ""}`}
            >{k + 1}</button>
          ))}
        </div>
        <p className="contador">Pregunta {i + 1} de {reactivos.length}</p>
        <Reactivo key={i} reactivo={r} seleccion={resp[i]} onElegir={k => setResp(x => ({ ...x, [i]: k }))} revelar={false} mostrarTema />
        <div className="acciones">
          <button className="btn px" disabled={i === 0} onClick={() => setI(i - 1)}>← Anterior</button>
          {i < reactivos.length - 1
            ? <button className="btn px pink" onClick={() => setI(i + 1)}>Siguiente →</button>
            : <button className="btn px mint" onClick={() => setConfirmar(true)}>Terminar</button>}
        </div>
        {i < reactivos.length - 1 && <div className="acciones fin"><button className="btn-texto" onClick={() => setConfirmar(true)}>Terminar simulacro</button></div>}
        {confirmar && (
          <Confirmar
            etiqueta="Confirmar"
            centrado
            textoCancelar="Seguir revisando"
            onCancelar={() => setConfirmar(false)}
            textoConfirmar="Terminar"
            onConfirmar={terminar}
          >
            <p>
              {contestadas < reactivos.length
                ? `Te faltan ${reactivos.length - contestadas} preguntas sin responder. Cuentan como incorrectas.`
                : "Respondiste todo."}{" "}
              {Object.values(marcadas).filter(Boolean).length > 0 && `Tienes ${Object.values(marcadas).filter(Boolean).length} marcadas para revisar. `}
              ¿Terminar y ver tu calificación?
            </p>
          </Confirmar>
        )}
      </div>
    );
  }

  // resultados
  const flojos = TEMAS.filter(t => resultado.porTema[t.id] && resultado.porTema[t.id].ok < resultado.porTema[t.id].total);
  const medalla = medallaDeSimulacro(resultado.calificacion);
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={prog.racha} secuencia="nivel" compacto />
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
              <span className="bt-barra"><i style={{ width: `${(pt.ok / pt.total) * 100}%` }} className={pt.ok === pt.total ? "ok" : pt.ok === 0 ? "mal" : ""} /></span>
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
        <button className="btn grande px pink" onClick={empezar}>Hacer otro simulacro</button>
      </div>

      <h2 className="sub revision-titulo">Revisión</h2>
      <div className="revision">
        {reactivos.map((r, k) => (
          <article key={k} className="rev px">
            <p className="rev-num">Pregunta {k + 1}</p>
            <Reactivo reactivo={r} seleccion={resp[k]} onElegir={() => {}} revelar mostrarTema />
          </article>
        ))}
      </div>
    </div>
  );
}

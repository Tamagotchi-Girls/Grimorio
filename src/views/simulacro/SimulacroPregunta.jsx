import Reactivo from "../../components/Reactivo.jsx";
import Sprite from "../../components/Sprite.jsx";
import Confirmar from "../../components/Confirmar.jsx";
import { mensajeConfirmacion } from "../../lib/useSimulacro.js";

const claseCelda = (s, k) =>
  `celda ${k === s.i ? "actual" : ""} ${s.respuestas[k] !== undefined ? "resp" : ""} ${s.marcadas[k] ? "marc" : ""}`;
const etiquetaCelda = (s, k) =>
  `Pregunta ${k + 1}${s.respuestas[k] !== undefined ? ", respondida" : ""}${s.marcadas[k] ? ", marcada" : ""}`;

// `s` es lo que devuelve useSimulacro().
export default function SimulacroPregunta({ s }) {
  const total = s.reactivos.length;
  return (
    <>
      <div className="sim-cabeza">
        <span className="eyebrow exam-pregunta">PREGUNTA {s.i + 1}/{total} · {s.contestadas} respondidas</span>
        <button className={`marcar px ${s.marcadas[s.i] ? "on" : ""}`} onClick={s.alternarMarca} aria-pressed={!!s.marcadas[s.i]}>
          <Sprite nombre="bandera" escala={3} /> {s.marcadas[s.i] ? "Marcada" : "Marcar para revisar"}
        </button>
      </div>
      <div className="mapa" aria-label="Ir a la pregunta">
        {s.reactivos.map((_, k) => (
          <button key={k} className={claseCelda(s, k)} onClick={() => s.irA(k)} aria-label={etiquetaCelda(s, k)}>{k + 1}</button>
        ))}
      </div>
      <p className="contador">Pregunta {s.i + 1} de {total}</p>
      <Reactivo key={s.i} reactivo={s.reactivo} seleccion={s.respuestas[s.i]} onElegir={s.responder} revelar={false} mostrarTema />
      <div className="acciones">
        <button className="btn px" disabled={s.i === 0} onClick={() => s.irA(s.i - 1)}>← Anterior</button>
        {s.ultima
          ? <button className="btn px mint" onClick={s.pedirConfirmar}>Terminar</button>
          : <button className="btn px pink" onClick={() => s.irA(s.i + 1)}>Siguiente →</button>}
      </div>
      {!s.ultima && <div className="acciones fin"><button className="btn-texto" onClick={s.pedirConfirmar}>Terminar simulacro</button></div>}
      {s.confirmando && (
        <Confirmar
          etiqueta="Confirmar"
          centrado
          textoCancelar="Seguir revisando"
          onCancelar={s.cancelarConfirmar}
          textoConfirmar="Terminar"
          onConfirmar={s.terminar}
        >
          <p>{mensajeConfirmacion(s.contestadas, total, s.totalMarcadas)}</p>
        </Confirmar>
      )}
    </>
  );
}

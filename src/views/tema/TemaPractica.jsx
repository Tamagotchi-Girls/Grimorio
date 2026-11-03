import Pips from "../../components/Pips.jsx";
import Reactivo from "../../components/Reactivo.jsx";
import { XP_POR_ACIERTO } from "../../lib/nivel.js";
import { enCampo, textoTeclas } from "../../lib/teclado.js";
import { estadosDeRonda } from "../../lib/usePractica.js";
import { useTeclasRespuesta } from "../../lib/useTeclasRespuesta.js";

// `p` es lo que devuelve usePractica(). Está montado solo mientras se practica, así que las teclas
// se activan al entrar y se sueltan al salir (o al terminar la ronda).
export default function TemaPractica({ p }) {
  useTeclasRespuesta({
    activo: true,
    totalOpciones: p.actual.opciones.length,
    onNumero: (opcion, e) => {
      if (enCampo(e) || p.respondida) return;
      e.preventDefault();
      p.elegir(opcion);
    },
    onEnter: (e) => {
      if (enCampo(e) || !p.respondida) return;
      e.preventDefault();
      p.siguiente();
    },
  });
  return (
    <section className="practica">
      <div className="progreso-ronda">
        <span>Reactivo {p.i + 1} de {p.reactivos.length}</span>
        <Pips className="grandes" estados={estadosDeRonda(p.reactivos, p.respuestas, p.i)} />
      </div>
      <Reactivo key={`${p.ronda}-${p.i}`} reactivo={p.actual} seleccion={p.seleccion} onElegir={p.elegir} revelar={p.respondida} />
      {p.respondida && p.actual.opcionesBarajadas[p.seleccion].correcta && <span className="xp-flotante" aria-live="polite">+{XP_POR_ACIERTO} XP</span>}
      <div className="acciones">
        <span className="ayuda">{textoTeclas(p.actual.opciones.length)} · Enter para seguir</span>
        <button className="btn px pink" disabled={!p.respondida} onClick={p.siguiente}>
          {p.ultima ? "Ver resultado" : "Siguiente →"}
        </button>
      </div>
    </section>
  );
}

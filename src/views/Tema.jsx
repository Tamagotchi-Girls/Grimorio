import { useEffect, useMemo, useState } from "react";
import { PREGUNTAS, TEMAS } from "../data/contenido.js";
import { prepararReactivo } from "../lib/progreso.js";
import { XP_POR_ACIERTO } from "../lib/nivel.js";
import { dosDigitos } from "../lib/formato.js";
import { medallaDeTema } from "../lib/medallas.js";
import Codigo from "../components/Codigo.jsx";
import Reactivo from "../components/Reactivo.jsx";
import Sprite from "../components/Sprite.jsx";
import Escena from "../components/Escena.jsx";
import Bocadillo from "../components/Bocadillo.jsx";

export default function Tema({ id, prog, ir, perfil }) {
  const tema = TEMAS.find(t => t.id === id);
  const [pestana, setPestana] = useState("apuntes");
  const [pagina, setPagina] = useState(0);
  const [ronda, setRonda] = useState(0);
  // `ronda` no se lee dentro: cambiarla fuerza a barajar de nuevo las opciones al repetir el tema.
  const reactivos = useMemo(
    () => PREGUNTAS.filter(p => p.tema === id).map(prepararReactivo),
    [id, ronda]
  );
  const [i, setI] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const actual = reactivos[i];
  const sel = respuestas[i];
  const respondida = sel !== undefined;
  const terminado = i >= reactivos.length;

  const elegir = (k) => {
    if (respondida) return;
    setRespuestas(r => ({ ...r, [i]: k }));
    prog.registrar(actual.id, actual.opcionesBarajadas[k].correcta);
  };
  const siguiente = () => setI(v => v + 1);
  const repetir = () => { setRonda(r => r + 1); setI(0); setRespuestas({}); };

  useEffect(() => {
    if (pestana !== "practicar" || terminado) return;
    const h = (e) => {
      if (e.target.closest && e.target.closest("input, textarea")) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && !respondida) { e.preventDefault(); elegir(n - 1); }
      else if (e.key === "Enter" && respondida) { e.preventDefault(); siguiente(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (!tema) return <div className="vista"><p>Ese tema no existe.</p><button className="btn px" onClick={() => ir("temas")}>Ver temas</button></div>;

  const aciertos = reactivos.filter((r, k) => respuestas[k] !== undefined && r.opcionesBarajadas[respuestas[k]].correcta).length;
  const siguienteTema = TEMAS.find(t => t.id === id + 1);
  const medalla = medallaDeTema(aciertos, reactivos.length);

  return (
    <div className="vista">
      <div className="escena-wrap">
        <Escena
          hada={perfil.avatar}
          dia={prog.racha}
          compacto
          secuencia={respondida ? (actual.opcionesBarajadas[sel].correcta ? "acierto" : "fallo") : "reposo"}
        />
      </div>
      <button className="volver" onClick={() => ir("temas")}>← Temas</button>
      <section className="intro">
        <p className="eyebrow">Tema {dosDigitos(tema.id)} de 10</p>
        <h1>{tema.nombre}</h1>
      </section>

      <div className="pestanas" role="tablist">
        <button role="tab" aria-selected={pestana === "apuntes"} className={`pestana px ${pestana === "apuntes" ? "on" : ""}`} onClick={() => setPestana("apuntes")}>Apuntes</button>
        <button role="tab" aria-selected={pestana === "practicar"} className={`pestana px ${pestana === "practicar" ? "on" : ""}`} onClick={() => setPestana("practicar")}>Practicar</button>
      </div>

      {pestana === "apuntes" && (
        <section className="apuntes px">
          <h2 className="sub">Lo que tienes que saber</h2>
          <Bocadillo texto={tema.apuntes[pagina]} className="apunte-dialogo" />
          <div className="paginacion-apuntes" aria-label="Páginas de apuntes">
            <button className="btn px" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>◀</button>
            <span>{pagina + 1} / {tema.apuntes.length}</span>
            <button className="btn px" disabled={pagina === tema.apuntes.length - 1} onClick={() => setPagina((p) => p + 1)}>▶</button>
          </div>
          <h2 className="sub">Ejemplo</h2>
          <Codigo codigo={tema.ejemplo} />
          <button className="btn grande px pink" onClick={() => setPestana("practicar")}>Practicar este tema →</button>
        </section>
      )}

      {pestana === "practicar" && !terminado && (
        <section className="practica">
          <div className="progreso-ronda">
            <span>Reactivo {i + 1} de {reactivos.length}</span>
            <span className="pips grandes">
              {reactivos.map((r, k) => {
                const s = respuestas[k];
                const c = s === undefined ? (k === i ? "actual" : "nada") : r.opcionesBarajadas[s].correcta ? "ok" : "mal";
                return <i key={k} className={c} />;
              })}
            </span>
          </div>
          <Reactivo key={`${ronda}-${i}`} reactivo={actual} seleccion={sel} onElegir={elegir} revelar={respondida} />
          {respondida && actual.opcionesBarajadas[sel].correcta && <span className="xp-flotante" aria-live="polite">+{XP_POR_ACIERTO} XP</span>}
          <div className="acciones">
            <span className="ayuda">Teclas 1–4 para responder · Enter para seguir</span>
            <button className="btn px pink" disabled={!respondida} onClick={siguiente}>
              {i === reactivos.length - 1 ? "Ver resultado" : "Siguiente →"}
            </button>
          </div>
        </section>
      )}

      {pestana === "practicar" && terminado && (
        <section className="final px">
          <Sprite nombre={medalla} escala={7} className={medalla === "copa" ? "festejo" : ""} />
          <h2>{aciertos} de {reactivos.length}</h2>
          <p>
            {medalla === "copa"
              ? "¡Tema dominado! Cada respuesta fue correcta."
              : medalla === "estrella"
              ? "¡Muy bien! Revisa los apuntes de lo que fallaste y vuelve a intentarlo."
              : "Lee otra vez los apuntes con calma. La segunda vuelta siempre sale mejor."}
          </p>
          <div className="acciones centro">
            <button className="btn px" onClick={() => { setPestana("apuntes"); repetir(); }}>Ver apuntes</button>
            <button className="btn px mint" onClick={repetir}>Repetir tema</button>
            {siguienteTema && <button className="btn px pink" onClick={() => ir(`tema/${siguienteTema.id}`)}>Tema {siguienteTema.id} →</button>}
          </div>
        </section>
      )}
    </div>
  );
}

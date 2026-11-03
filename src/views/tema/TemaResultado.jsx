import Sprite from "../../components/Sprite.jsx";
import { mensajeResultado } from "../../lib/usePractica.js";

export default function TemaResultado({ aciertos, total, medalla, siguienteTema, ir, onVerApuntes, onRepetir }) {
  return (
    <section className="final px">
      <Sprite nombre={medalla} escala={7} className={medalla === "copa" ? "festejo" : ""} />
      <h2>{aciertos} de {total}</h2>
      <p>{mensajeResultado(medalla)}</p>
      <div className="acciones centro">
        <button className="btn px" onClick={onVerApuntes}>Ver apuntes</button>
        <button className="btn px mint" onClick={onRepetir}>Repetir tema</button>
        {siguienteTema && <button className="btn px pink" onClick={() => ir(`tema/${siguienteTema.id}`)}>Tema {siguienteTema.id} →</button>}
      </div>
    </section>
  );
}

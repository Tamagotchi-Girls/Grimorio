import Codigo from "./Codigo.jsx";
import Bocadillo from "./Bocadillo.jsx";
import { TEMAS } from "../data/contenido.js";

export const TIPOS = {
  concepto: "Concepto",
  imprime: "¿Qué imprime?",
  error: "Encuentra el error",
  completa: "Completa el código"
};

// Muestra un reactivo. Si `revelar` es true, colorea la correcta y la elegida y muestra la explicación.
export default function Reactivo({ reactivo, seleccion, onElegir, revelar, mostrarTema = false }) {
  const tema = TEMAS.find(t => t.id === reactivo.tema);
  const mono = reactivo.tipo === "imprime" || reactivo.tipo === "completa";
  return (
    <div className="reactivo">
      <div className="reactivo-meta">
        <span className={`tag tag-${reactivo.tipo}`}>{TIPOS[reactivo.tipo]}</span>
        {mostrarTema && <span className="tag tag-tema">Tema {tema.id} · {tema.corto}</span>}
      </div>
      <h2 className="pregunta">{reactivo.pregunta}</h2>
      {reactivo.codigo && <Codigo codigo={reactivo.codigo} />}
      <fieldset className="opciones" aria-label="Opciones">
        <legend className="sr">Elige una respuesta</legend>
        {reactivo.opcionesBarajadas.map((op, i) => {
          let estado = "";
          if (revelar) {
            if (op.correcta) estado = "ok";
            else if (seleccion === i) estado = "mal";
            else estado = "apagada";
          } else if (seleccion === i) estado = "elegida";
          return (
            <label
              key={i}
              className={`opcion px ${estado}`}
            >
              <input type="radio" name={`reactivo-${reactivo.id}`} checked={seleccion === i} disabled={revelar} onChange={() => onElegir(i)} />
              <span className="tecla">{i + 1}</span>
              <span className={mono ? "op-texto mono" : "op-texto"}>{op.texto}</span>
              {revelar && op.correcta && <span className="marca" aria-label="Correcta">✓</span>}
              {revelar && !op.correcta && seleccion === i && <span className="marca" aria-label="Tu respuesta">✗</span>}
            </label>
          );
        })}
        </fieldset>
      {revelar && (
        <Bocadillo
          className={`explicacion ${reactivo.opcionesBarajadas[seleccion]?.correcta ? "bien" : "mal"}`}
          texto={`${seleccion === null || seleccion === undefined ? "Sin responder." : reactivo.opcionesBarajadas[seleccion].correcta ? "✓ Correcto." : "✗ Incorrecto."} ${reactivo.explicacion}`}
        />
      )}
    </div>
  );
}

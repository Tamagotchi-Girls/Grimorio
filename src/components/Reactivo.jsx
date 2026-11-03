import { useContenido } from "../data/ContenidoContext.jsx";
import Bocadillo from "./Bocadillo.jsx";
import Codigo from "./Codigo.jsx";

const TIPOS = {
  concepto: "Concepto",
  imprime: "¿Qué imprime?",
  error: "Encuentra el error",
  completa: "Completa el código"
};

// Clase de estado de la opción `i`: al revelar, "ok" la correcta, "mal" la elegida si falló y "apagada" las demás;
// sin revelar, "elegida" la que está marcada.
export function estadoOpcion(opcion, i, seleccion, revelar) {
  if (revelar) return opcion.correcta ? "ok" : seleccion === i ? "mal" : "apagada";
  return seleccion === i ? "elegida" : "";
}

// Texto del recuadro de explicación: cómo salió la respuesta y luego la explicación del reactivo.
export function textoExplicacion(reactivo, seleccion) {
  const resultado = seleccion === null || seleccion === undefined
    ? "Sin responder."
    : reactivo.opcionesBarajadas[seleccion].correcta ? "✓ Correcto." : "✗ Incorrecto.";
  return `${resultado} ${reactivo.explicacion}`;
}

// Muestra un reactivo. Si `revelar` es true, colorea la correcta y la elegida y muestra la explicación.
export default function Reactivo({ reactivo, seleccion, onElegir, revelar, mostrarTema = false }) {
  const { TEMAS } = useContenido();
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
        {reactivo.opcionesBarajadas.map((op, i) => (
          <label
            key={i}
            className={`opcion px ${estadoOpcion(op, i, seleccion, revelar)}`}
          >
            <input type="radio" name={`reactivo-${reactivo.id}`} checked={seleccion === i} disabled={revelar} onChange={() => onElegir(i)} />
            <span className="tecla">{i + 1}</span>
            <span className={mono ? "op-texto mono" : "op-texto"}>{op.texto}</span>
            {revelar && op.correcta && <span className="marca" aria-label="Correcta">✓</span>}
            {revelar && !op.correcta && seleccion === i && <span className="marca" aria-label="Tu respuesta">✗</span>}
          </label>
        ))}
        </fieldset>
      {revelar && (
        <Bocadillo
          className={`explicacion ${reactivo.opcionesBarajadas[seleccion]?.correcta ? "bien" : "mal"}`}
          texto={textoExplicacion(reactivo, seleccion)}
        />
      )}
    </div>
  );
}

import { tokenizar } from "../lib/resaltado.js";

export default function Codigo({ codigo }) {
  const lineas = codigo.split("\n");
  return (
    <div className="codigo" role="region" aria-label="Código en C" tabIndex={0}>
      <pre>
        {lineas.map((l, i) => (
          <span className="linea" key={i}>
            <span className="num" aria-hidden="true">{i + 1}</span>
            <span className="txt">
              {tokenizar(l).map((tk, j) => tk.c ? <span key={j} className={tk.c}>{tk.t}</span> : tk.t)}
              {l === "" ? " " : null}
            </span>
          </span>
        ))}
      </pre>
    </div>
  );
}

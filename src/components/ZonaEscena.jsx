import Bocadillo from "./Bocadillo.jsx";
import Escena from "./Escena.jsx";

// Paisaje con el hada y, si hay `dialogo`, su bocadillo debajo. El resto de las props son las de Escena.
export default function ZonaEscena({ dialogo, ...escena }) {
  return (
    <div className="escena-wrap">
      <Escena {...escena} />
      {dialogo !== undefined && <Bocadillo className="bocadillo-escena" texto={dialogo} />}
    </div>
  );
}

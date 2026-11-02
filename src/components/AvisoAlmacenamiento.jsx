import { useEffect, useState, useSyncExternalStore } from "react";
import { huboFalloAlGuardar, suscribirFallos } from "../lib/almacenamiento.js";

// Avisa, sin interrumpir, cuando el navegador no deja guardar (almacenamiento lleno o modo privado).
// El contenedor con role="status" existe siempre para que los lectores de pantalla anuncien el texto
// cuando aparece; el aviso se queda hasta que se cierra o hasta que un guardado vuelve a funcionar.
export default function AvisoAlmacenamiento() {
  const fallo = useSyncExternalStore(suscribirFallos, huboFalloAlGuardar, () => false);
  const [cerrado, setCerrado] = useState(false);
  useEffect(() => { if (!fallo) setCerrado(false); }, [fallo]);
  return (
    <div className="aviso-guardado" role="status" aria-live="polite">
      {fallo && !cerrado && (
        <div className="px">
          <p>No se pudo guardar en este dispositivo (almacenamiento lleno o modo privado). Tu progreso se perderá al cerrar.</p>
          <button className="btn px" onClick={() => setCerrado(true)}>Entendido</button>
        </div>
      )}
    </div>
  );
}

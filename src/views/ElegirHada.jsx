import { useState } from "react";
import Hada, { HADAS, normalizarHada } from "../components/Hada.jsx";
import ZonaEscena from "../components/ZonaEscena.jsx";

// Pantalla "Elige tu hada": se usa en la bienvenida y cada vez que el alumno quiere cambiar de hada.
// El fondo cambia al paisaje del hada que tiene el foco.
export default function ElegirHada({ inicial = "riley", onElegir, onVolver, textoVolver = "◀ ATRÁS", textoListo = "¡COMENZAR!" }) {
  const [hada, setHada] = useState(() => normalizarHada(inicial));
  const elegida = HADAS.find((h) => h.id === hada);

  const enviar = (e) => {
    e.preventDefault();
    onElegir(hada);
  };

  return (
    <div className="vista elegir-hada">
      <ZonaEscena hada={hada} secuencia="seleccion_activa" dialogo={`Soy ${elegida.nombre}, hada de ${elegida.elemento}. Mi hogar es el ${elegida.paisaje}. ¿Estudiamos juntas?`} />
      <form onSubmit={enviar}>
        <fieldset className="hada-fieldset">
          <legend>Elige tu hada compañera</legend>
          <div className="hadas-grid">
            {HADAS.map((h) => {
              const activa = h.id === hada;
              return (
                <label className={`hada-card px ${activa ? "seleccionada" : ""}`} key={h.id}>
                  <input
                    type="radio"
                    name="hada"
                    value={h.id}
                    checked={activa}
                    onChange={() => setHada(h.id)}
                  />
                  <Hada
                    nombre={h.id}
                    secuencia={activa ? "seleccion_activa" : "seleccion_inactiva"}
                    alt={`${h.nombre}, hada de ${h.elemento}`}
                  />
                  <span><strong>{h.nombre}</strong><small>{h.elemento}</small></span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="acciones onboarding-acciones">
          {onVolver && <button className="btn px" type="button" onClick={onVolver}>{textoVolver}</button>}
          <button className="btn grande mint px" type="submit">{textoListo}</button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import ZonaEscena from "../components/ZonaEscena.jsx";
import ElegirHada from "./ElegirHada.jsx";

export default function Bienvenida({ onContinuar }) {
  const [paso, setPaso] = useState("nombre");
  const [nombre, setNombre] = useState("");
  const [hada, setHada] = useState("riley");

  const siguiente = (e) => {
    e.preventDefault();
    if (nombre.trim()) setPaso("hada");
  };

  if (paso === "nombre") return (
    <div className="vista bienvenida">
      <ZonaEscena hada="riley" dialogo="¡Hola! Antes de abrir el grimorio… ¿Cómo te llamas?" />
      <form className="perfil-form onboarding-form" onSubmit={siguiente}>
        <label className="campo">
          <span>¿Cómo te llamas?</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" maxLength={32} required autoFocus />
        </label>
        <button className="btn grande pink px" type="submit" disabled={!nombre.trim()}>SIGUIENTE ▶</button>
      </form>
    </div>
  );

  return (
    <ElegirHada
      inicial={hada}
      onElegir={(id) => { setHada(id); onContinuar({ nombre: nombre.trim().slice(0, 32), avatar: id }); }}
      onVolver={() => setPaso("nombre")}
    />
  );
}

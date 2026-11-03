import { useState } from "react";
import Encabezado from "../components/Encabezado.jsx";
import Transferencia from "../components/Transferencia.jsx";
import ZonaEscena from "../components/ZonaEscena.jsx";
import BorrarProgreso from "./progreso/BorrarProgreso.jsx";
import DominioPorTema from "./progreso/DominioPorTema.jsx";
import FormularioNombre from "./progreso/FormularioNombre.jsx";
import HistorialSimulacros from "./progreso/HistorialSimulacros.jsx";
import TarjetaNivel from "./progreso/TarjetaNivel.jsx";

export default function Progreso({ prog, ir, perfil, setPerfil, materia }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(perfil.nombre);
  const guardarNombre = (e) => { e.preventDefault(); setPerfil({ ...perfil, nombre: nombre.trim() || perfil.nombre }); setEditando(false); };
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={prog.racha} compacto />
      <Encabezado eyebrow={`Logros · ${materia}`} titulo="Tu progreso" />
      <TarjetaNivel perfil={perfil} prog={prog} onCambiarNombre={() => setEditando(!editando)} onCambiarHada={() => ir("hada")} />
      {editando && <FormularioNombre nombre={nombre} onNombre={setNombre} onGuardar={guardarNombre} onCancelar={() => setEditando(false)} />}
      <DominioPorTema prog={prog} ir={ir} />
      <HistorialSimulacros simulacros={prog.datos.simulacros} onHacerPrimero={() => ir("simulacro")} />
      <Transferencia perfil={perfil} />
      <BorrarProgreso materia={materia} onBorrar={prog.reiniciar} />
    </div>
  );
}

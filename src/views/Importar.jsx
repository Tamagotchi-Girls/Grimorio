import { useMemo, useState } from "react";
import HadaRetrato from "../components/HadaRetrato.jsx";
import { decodificarEnlace } from "../lib/transferencia.js";
import { guardarProgreso, leerProgreso } from "../lib/progreso.js";
import Escena from "../components/Escena.jsx";
import Bocadillo from "../components/Bocadillo.jsx";

const nivel = (d) => 1 + Math.floor((d?.xp || 0) / 100);

export default function Importar({ onListo }) {
  const datos = useMemo(decodificarEnlace, []);
  const [confirmar, setConfirmar] = useState(false);
  if (!datos?.perfil || !datos?.progreso) return (
    <div className="vista"><section className="final px"><h1>Este enlace no es válido</h1><p>Pide un enlace nuevo desde la pantalla Logros.</p></section></div>
  );
  const guardar = (modo) => {
    ["PE", "FP"].forEach((id) => {
      const entrante = datos.progreso[id] || {};
      if (modo === "reemplazar") guardarProgreso(id, entrante);
      else {
        const local = leerProgreso(id);
        const preguntas = { ...local.preguntas, ...entrante.preguntas };
        const simulacros = [...local.simulacros, ...(entrante.simulacros || [])].slice(-10);
        const diasEstudio = [...new Set([...local.diasEstudio, ...(entrante.diasEstudio || [])])].slice(-90);
        guardarProgreso(id, { xp: Math.max(local.xp || 0, entrante.xp || 0), preguntas, simulacros, diasEstudio });
      }
    });
    onListo(datos.perfil);
  };
  return (
    <div className="vista importar">
      <div className="escena-wrap">
        <Escena hada={datos.perfil.avatar} />
      <Bocadillo className="bocadillo-escena" texto={`Encontré el grimorio de ${datos.perfil.nombre}. PE nivel ${nivel(datos.progreso.PE)} y FP nivel ${nivel(datos.progreso.FP)}. ¿Cómo quieres importarlo?`} />
      </div>
      <section className="preview-perfil px">
        <HadaRetrato hada={datos.perfil.avatar} />
        <div><span className="stat-k">Perfil encontrado</span><h2>{datos.perfil.nombre}</h2><p>PE · Nivel {nivel(datos.progreso.PE)} &nbsp; FP · Nivel {nivel(datos.progreso.FP)}</p></div>
      </section>
      <button className="btn grande mint px" onClick={() => guardar("combinar")}>Combinar con lo de aquí</button>
      {!confirmar ? <button className="btn-texto" onClick={() => setConfirmar(true)}>Reemplazar mi progreso actual</button> : (
        <div className="confirmar px" role="alertdialog" aria-label="Confirmar reemplazo">
          <p><strong>Advertencia:</strong> se borrará el progreso que ya existe en este dispositivo.</p>
          <div className="acciones"><button className="btn px" onClick={() => setConfirmar(false)}>Cancelar</button><button className="btn px pink" onClick={() => guardar("reemplazar")}>Sí, reemplazar</button></div>
        </div>
      )}
    </div>
  );
}

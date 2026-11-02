import { useMemo, useState } from "react";
import HadaRetrato from "../components/HadaRetrato.jsx";
import { decodificarEnlace } from "../lib/transferencia.js";
import { guardarProgreso, leerProgreso } from "../lib/progreso.js";
import { combinarProgreso } from "../lib/validacion.js";
import { nivelDe } from "../lib/nivel.js";
import { MATERIAS } from "../data/materias.js";
import ZonaEscena from "../components/ZonaEscena.jsx";
import Confirmar from "../components/Confirmar.jsx";

const nivel = (d) => nivelDe(d?.xp);

export default function Importar({ onListo }) {
  const datos = useMemo(decodificarEnlace, []);
  const [confirmar, setConfirmar] = useState(false);
  if (!datos?.perfil || !datos?.progreso) return (
    <div className="vista"><section className="final px"><h1>Este enlace no es válido</h1><p>Pide un enlace nuevo desde la pantalla Logros.</p></section></div>
  );
  const guardar = (modo) => {
    MATERIAS.forEach(({ id }) => {
      const entrante = datos.progreso[id];
      guardarProgreso(id, modo === "reemplazar" ? entrante : combinarProgreso(leerProgreso(id), entrante, id));
    });
    onListo(datos.perfil);
  };
  return (
    <div className="vista importar">
      <ZonaEscena hada={datos.perfil.avatar} dialogo={`Encontré el grimorio de ${datos.perfil.nombre}. PE nivel ${nivel(datos.progreso.PE)} y FP nivel ${nivel(datos.progreso.FP)}. ¿Cómo quieres importarlo?`} />
      <section className="preview-perfil px">
        <HadaRetrato hada={datos.perfil.avatar} />
        <div><span className="stat-k">Perfil encontrado</span><h2>{datos.perfil.nombre}</h2><p>PE · Nivel {nivel(datos.progreso.PE)} &nbsp; FP · Nivel {nivel(datos.progreso.FP)}</p></div>
      </section>
      <button className="btn grande mint px" onClick={() => guardar("combinar")}>Combinar con lo de aquí</button>
      {!confirmar ? <button className="btn-texto" onClick={() => setConfirmar(true)}>Reemplazar mi progreso actual</button> : (
        <Confirmar
          etiqueta="Confirmar reemplazo"
          textoCancelar="Cancelar"
          onCancelar={() => setConfirmar(false)}
          textoConfirmar="Sí, reemplazar"
          onConfirmar={() => guardar("reemplazar")}
        >
          <p><strong>Advertencia:</strong> se borrará el progreso que ya existe en este dispositivo.</p>
        </Confirmar>
      )}
    </div>
  );
}

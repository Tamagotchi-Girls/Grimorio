import { useState } from "react";
import { TEMAS } from "../data/contenido.js";
import { XP_POR_NIVEL } from "../lib/nivel.js";
import HadaRetrato from "../components/HadaRetrato.jsx";
import Transferencia from "../components/Transferencia.jsx";
import ZonaEscena from "../components/ZonaEscena.jsx";
import Encabezado from "../components/Encabezado.jsx";
import BarraXP from "../components/BarraXP.jsx";
import Pips from "../components/Pips.jsx";
import FilaTema from "../components/FilaTema.jsx";
import Confirmar from "../components/Confirmar.jsx";

const fmt = (iso) => {
  try { return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

export default function Progreso({ prog, ir, perfil, setPerfil, materia }) {
  const [editando, setEditando] = useState(false);
  const [borrado, setBorrado] = useState(false);
  const [nombre, setNombre] = useState(perfil.nombre);
  const sims = [...prog.datos.simulacros].reverse();
  const guardarPerfil = (e) => { e.preventDefault(); setPerfil({ ...perfil, nombre: nombre.trim() || perfil.nombre }); setEditando(false); };
  return (
    <div className="vista">
      <ZonaEscena hada={perfil.avatar} dia={prog.racha} compacto />
      <Encabezado eyebrow={`Logros · ${materia}`} titulo="Tu progreso" />
      <section className="nivel px">
        <HadaRetrato hada={perfil.avatar} />
        <div className="nivel-info">
          <span className="stat-k">{perfil.nombre} · Nivel</span><span className="stat-v">{prog.nivel}</span>
          <BarraXP xpNivel={prog.xpNivel} />
          <span className="stat-s">{prog.datos.xp} XP en total · racha de {prog.racha} día{prog.racha === 1 ? "" : "s"} · {XP_POR_NIVEL - prog.xpNivel} para subir</span>
          <span className="editar-perfil-acciones">
            <button className="btn-texto editar-perfil" onClick={() => setEditando(!editando)}>Cambiar nombre</button>
            <button className="btn-texto editar-perfil" onClick={() => ir("hada")}>✦ Cambiar de hada</button>
          </span>
        </div>
      </section>
      {editando && (
        <form className="perfil-form compacto px" onSubmit={guardarPerfil}>
          <label className="campo"><span>Nombre</span><input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={32} /></label>
          <div className="acciones"><button className="btn px" type="button" onClick={() => setEditando(false)}>Cancelar</button><button className="btn pink px" type="submit">Guardar cambios</button></div>
        </form>
      )}
      <section className="por-tema px"><h2 className="sub">Dominio por tema</h2>
        {TEMAS.map((t) => {
          const { ok, total } = prog.resumenTema(t.id);
          return (
            <FilaTema key={t.id} tema={t} conteo={`${ok}/${total}`} onClick={() => ir(`tema/${t.id}`)}>
              <Pips estados={prog.estadoTema(t.id)} etiqueta={`${ok} de ${total}`} />
            </FilaTema>
          );
        })}
      </section>
      <section className="historial px"><h2 className="sub">Historial de simulacros</h2>
        {sims.length === 0 ? <p className="nota">Aún no haces simulacros. <button className="btn-texto" onClick={() => ir("simulacro")}>Hacer el primero →</button></p> :
          <ol>{sims.map((s, k) => <li key={k}><span>{fmt(s.fecha)}</span><span className="h-barra"><i style={{ width: `${s.calificacion}%` }} /></span><b>{s.calificacion}</b></li>)}</ol>}
      </section>
      <Transferencia perfil={perfil} />
      <div className="reinicio">
        {!borrado
          ? <button className="btn-texto" onClick={() => setBorrado(true)}>Borrar progreso de {materia}</button>
          : (
            <Confirmar
              textoCancelar="Cancelar"
              onCancelar={() => setBorrado(false)}
              textoConfirmar="Sí, borrar"
              onConfirmar={() => { prog.reiniciar(); setBorrado(false); }}
              claseConfirmar="btn pink px"
            >
              <p>Se borrarán nivel, dominio y simulacros de esta materia. No se puede deshacer.</p>
            </Confirmar>
          )}
      </div>
    </div>
  );
}

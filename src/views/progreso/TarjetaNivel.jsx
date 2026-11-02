import { XP_POR_NIVEL } from "../../lib/nivel.js";
import HadaRetrato from "../../components/HadaRetrato.jsx";
import BarraXP from "../../components/BarraXP.jsx";

const textoRacha = (racha) => `racha de ${racha} día${racha === 1 ? "" : "s"}`;

export default function TarjetaNivel({ perfil, prog, onCambiarNombre, onCambiarHada }) {
  return (
    <section className="nivel px">
      <HadaRetrato hada={perfil.avatar} />
      <div className="nivel-info">
        <span className="stat-k">{perfil.nombre} · Nivel</span><span className="stat-v">{prog.nivel}</span>
        <BarraXP xpNivel={prog.xpNivel} />
        <span className="stat-s">{prog.datos.xp} XP en total · {textoRacha(prog.racha)} · {XP_POR_NIVEL - prog.xpNivel} para subir</span>
        <span className="editar-perfil-acciones">
          <button className="btn-texto editar-perfil" onClick={onCambiarNombre}>Cambiar nombre</button>
          <button className="btn-texto editar-perfil" onClick={onCambiarHada}>✦ Cambiar de hada</button>
        </span>
      </div>
    </section>
  );
}

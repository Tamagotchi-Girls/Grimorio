import Escena from "./Escena.jsx";

// Compatibilidad para las vistas: todos los fondos usan exclusivamente el paisaje oficial
// asociado al hada del perfil; `tipo` ya no genera ilustración propia.
export default function Paisaje({ avatar = "riley", nombre, compacto = false, secuencia = "reposo", dia = 1 }) {
  return <Escena avatar={nombre || avatar} compacto={compacto} secuencia={secuencia} dia={dia} />;
}

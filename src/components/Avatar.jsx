import Hada, { HADAS } from "./Hada.jsx";

export const AVATARES = HADAS.map((h) => ({
  id: h.id,
  nombre: h.nombre,
  genero: `Hada de ${h.elemento}`,
  elemento: h.elemento,
}));

export const normalizarAvatar = (id) => HADAS.some((h) => h.id === id) ? id : "riley";

export default function Avatar({ id = "riley", titulo, className = "", secuencia = "reposo" }) {
  const nombre = normalizarAvatar(id);
  const hada = HADAS.find((h) => h.id === nombre);
  return (
    <span className={`avatar avatar-oficial ${className}`}>
      <Hada nombre={nombre} secuencia={secuencia} alt={titulo || `${hada.nombre}, hada de ${hada.elemento}`} />
    </span>
  );
}

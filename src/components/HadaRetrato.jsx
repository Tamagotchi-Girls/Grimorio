import Hada, { HADAS, normalizarHada } from "./Hada.jsx";

// Retrato del hada: el fotograma completo (320x150) recortado a 160x150 por `.avatar-oficial`.
export default function HadaRetrato({ hada = "riley" }) {
  const id = normalizarHada(hada);
  const { nombre, elemento } = HADAS.find((h) => h.id === id);
  return (
    <span className="avatar avatar-oficial">
      <Hada nombre={id} alt={`${nombre}, hada de ${elemento}`} />
    </span>
  );
}

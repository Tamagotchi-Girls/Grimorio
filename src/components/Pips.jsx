// Fila de cuadritos, uno por reactivo: cada estado ("ok", "mal", "nada", "actual") es la clase de su cuadrito.
// `etiqueta` es el aria-label; sin ella, la fila no se anuncia (es decorativa junto a un texto).
export default function Pips({ estados, etiqueta, className = "" }) {
  return (
    <span className={className ? `pips ${className}` : "pips"} aria-label={etiqueta}>
      {estados.map((e, i) => <i key={i} className={e} />)}
    </span>
  );
}

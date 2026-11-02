// Tarjeta de dato de la portada: etiqueta, valor grande, (opcional) algo en medio como una barra y una nota.
export default function Stat({ etiqueta, valor, nota, children }) {
  return (
    <div className="stat px">
      <span className="stat-k">{etiqueta}</span>
      <span className="stat-v">{valor}</span>
      {children}
      <span className="stat-s">{nota}</span>
    </div>
  );
}

// Fila "N. Tema … 3/6": nombre, algo en medio (`children`: cuadritos o una barra) y el conteo.
// Con `onClick` es un botón que lleva al tema; sin él, una fila de solo lectura.
export default function FilaTema({ tema, conteo, onClick, children }) {
  const contenido = (
    <>
      <span className="bt-nombre">{tema.id}. {tema.corto}</span>
      {children}
      <span className="bt-num">{conteo}</span>
    </>
  );
  return onClick
    ? <button className="barra-tema link" onClick={onClick}>{contenido}</button>
    : <div className="barra-tema">{contenido}</div>;
}

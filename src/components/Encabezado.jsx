// Encabezado de pantalla: sobretítulo, título y (opcional) un párrafo introductorio como `children`.
export default function Encabezado({ eyebrow, titulo, children }) {
  return (
    <section className="intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{titulo}</h1>
      {children}
    </section>
  );
}

// Cuadro de confirmación en línea. `children` es el mensaje (un <p>).
// - `etiqueta`: si se da, el cuadro es un alertdialog con ese aria-label; si no, es un bloque sin rol
//   (así está hoy el de "borrar progreso").
// - `centrado`: botones centrados (clase "acciones centro").
// - `claseConfirmar`: clases del botón de confirmar; el de "borrar progreso" las escribe en otro orden.
// Teclado: los botones se alcanzan con Tab y se activan con Enter o Espacio, como siempre. Todavía no
// atrapa el foco ni cierra con Escape (pendiente de accesibilidad en docs/PENDIENTES.md).
export default function Confirmar({
  children, etiqueta, centrado = false,
  textoCancelar, onCancelar, textoConfirmar, onConfirmar, claseConfirmar = "btn px pink",
}) {
  return (
    <div className="confirmar px" role={etiqueta ? "alertdialog" : undefined} aria-label={etiqueta}>
      {children}
      <div className={centrado ? "acciones centro" : "acciones"}>
        <button className="btn px" onClick={onCancelar}>{textoCancelar}</button>
        <button className={claseConfirmar} onClick={onConfirmar}>{textoConfirmar}</button>
      </div>
    </div>
  );
}

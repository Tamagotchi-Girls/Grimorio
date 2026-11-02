// La flechita ▶ que marca la opción activa de un menú. `clase` es la del menú ("menu-cursor" o "tema-cursor");
// cada menú sigue con su propia semántica, esto solo dibuja el cursor.
export default function CursorMenu({ clase }) {
  return <span className={clase} aria-hidden="true">▶</span>;
}

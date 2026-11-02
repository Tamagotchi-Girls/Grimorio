// La pantalla de la app (`.pantalla`) es el contenedor con scroll, no la ventana: `window.scrollTo(0, 0)` solo
// no hace nada. Esto regresa los dos al inicio (la ventana por si algún diseño la desplaza).
export function irAlInicio() {
  const pantalla = document.querySelector(".pantalla");
  if (pantalla) pantalla.scrollTop = 0;
  window.scrollTo(0, 0);
}

import BarraEstado from "./BarraEstado.jsx";
import Navegacion from "./Navegacion.jsx";

// El marco de la app, dibujado una sola vez: barra de estado, pantalla, navegación y pie.
// - `barra`: props de BarraEstado.
// - `sola`: la pantalla ocupa todo (pantallas previas); `id`: ancla del contenido principal.
// - `ruta` / `ir` / `bloqueada`: props de Navegacion (en las pantallas previas va bloqueada).
// - `superposicion`: lo que va antes de la barra (el aviso de LEVEL UP).
export default function Aparato({ barra, sola = false, id, ruta = "", ir = () => {}, bloqueada = false, superposicion, children }) {
  return (
    <>
      <div className="aparato">
        {superposicion}
        <BarraEstado {...barra} />
        <main className={sola ? "pantalla pantalla-sola" : "pantalla"} id={id}>{children}</main>
        <Navegacion ruta={ruta} ir={ir} bloqueada={bloqueada} />
      </div>
      <footer className="pie"><span aria-hidden="true">✦</span> tamagotchigirls 2026</footer>
    </>
  );
}

import { createElement } from "react";
import { useContenido } from "../data/ContenidoContext.jsx";
import { useSimulacro } from "../lib/useSimulacro.js";
import ZonaEscena from "../components/ZonaEscena.jsx";
import SimulacroIntro from "./simulacro/SimulacroIntro.jsx";
import SimulacroPregunta from "./simulacro/SimulacroPregunta.jsx";
import SimulacroResultados from "./simulacro/SimulacroResultados.jsx";

// Las tres fases son funciones de presentación (sin hooks) que devuelven un fragmento. Aquí se llaman como
// funciones y sus hijos se ponen directamente dentro de `.vista`, junto a la escena, y NO como componentes
// anidados. Motivo: cuando todo era un solo componente, React reutilizaba los nodos del DOM al pasar de una fase
// a otra y el "scroll anchoring" de Chrome dejaba el scroll de `.pantalla` en cierta posición al terminar el
// simulacro. Con componentes anidados los nodos se recrean y esa posición cambia (se vería distinto en celular y
// tablet). Si algún día se prefiere otra posición (p. ej. arriba del todo), se puede volver a componentes.
export default function Simulacro({ prog, ir, perfil }) {
  const { TEMAS } = useContenido();
  const s = useSimulacro(prog);
  const fase = s.fase === "intro" ? SimulacroIntro({ temas: TEMAS, simulacros: prog.datos.simulacros, onEmpezar: s.empezar })
    : s.fase === "jugando" ? SimulacroPregunta({ s })
    : SimulacroResultados({ temas: TEMAS, resultado: s.resultado, reactivos: s.reactivos, respuestas: s.respuestas, ir, onOtro: s.empezar });
  const escena = (
    <ZonaEscena
      hada={perfil.avatar}
      dia={prog.racha}
      compacto={s.fase !== "intro"}
      secuencia={s.fase === "resultados" ? "nivel" : undefined}
    />
  );
  return createElement("div", { className: "vista" }, escena, ...fase.props.children);
}

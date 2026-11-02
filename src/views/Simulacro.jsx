import { useSimulacro } from "../lib/useSimulacro.js";
import SimulacroIntro from "./simulacro/SimulacroIntro.jsx";
import SimulacroPregunta from "./simulacro/SimulacroPregunta.jsx";
import SimulacroResultados from "./simulacro/SimulacroResultados.jsx";

export default function Simulacro({ prog, ir, perfil }) {
  const s = useSimulacro(prog);
  if (s.fase === "intro") return <SimulacroIntro perfil={perfil} racha={prog.racha} simulacros={prog.datos.simulacros} onEmpezar={s.empezar} />;
  if (s.fase === "jugando") return <SimulacroPregunta s={s} perfil={perfil} racha={prog.racha} />;
  return (
    <SimulacroResultados
      resultado={s.resultado} reactivos={s.reactivos} respuestas={s.respuestas}
      perfil={perfil} racha={prog.racha} ir={ir} onOtro={s.empezar}
    />
  );
}

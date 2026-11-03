import { useRef, useState } from "react";
import Aparato from "./components/Aparato.jsx";
import AvisoAlmacenamiento from "./components/AvisoAlmacenamiento.jsx";
import Bocadillo from "./components/Bocadillo.jsx";
import Hada from "./components/Hada.jsx";
import { CONTENIDO } from "./data/contenido.js";
import { ContenidoProvider, useContenido } from "./data/ContenidoContext.jsx";
import { CLAVES, escribirJSON, escribirTexto, leerJSON, leerTexto, quitar } from "./lib/almacenamiento.js";
import { useAvisoNivel } from "./lib/avisoNivel.js";
import { useModoColor } from "./lib/modoColor.js";
import { resumenMateria, useProgreso } from "./lib/progreso.js";
import { useRuta } from "./lib/ruta.js";
import { normalizarPerfil } from "./lib/validacion.js";
import Bienvenida from "./views/Bienvenida.jsx";
import ElegirHada from "./views/ElegirHada.jsx";
import Importar from "./views/Importar.jsx";
import Inicio from "./views/Inicio.jsx";
import Materias from "./views/Materias.jsx";
import Progreso from "./views/Progreso.jsx";
import Simulacro from "./views/Simulacro.jsx";
import Tema from "./views/Tema.jsx";
import Temas from "./views/Temas.jsx";

const materiaGuardada = () => {
  const m = leerTexto(CLAVES.materiaActiva);
  return Object.hasOwn(CONTENIDO, m) ? m : null;
};

function Aplicacion({ perfil, setPerfil, materia, setMateria, ruta, ir, modoColor, onModoColor }) {
  const { PREGUNTAS } = useContenido();
  const prog = useProgreso();
  const levelUp = useAvisoNivel(prog.nivel);
  const cambiarMateria = () => { setMateria(null); quitar(CLAVES.materiaActiva); location.hash = "/materias"; };
  const [base, param] = ruta.split("/");
  let vista;
  if (base === "temas") vista = <Temas prog={prog} ir={ir} perfil={perfil} />;
  else if (base === "tema") vista = <Tema key={param} id={Number(param)} prog={prog} ir={ir} perfil={perfil} />;
  else if (base === "simulacro") vista = <Simulacro prog={prog} ir={ir} perfil={perfil} />;
  else if (base === "hada") vista = <ElegirHada
    key={perfil.avatar}
    inicial={perfil.avatar}
    textoListo="¡LISTO!"
    textoVolver="◀ CANCELAR"
    onVolver={() => ir("")}
    onElegir={(id) => { setPerfil({ ...perfil, avatar: id }); ir(""); }}
  />;
  else if (base === "progreso") vista = <Progreso prog={prog} ir={ir} perfil={perfil} setPerfil={setPerfil} materia={materia} />;
  else vista = <Inicio prog={prog} ir={ir} perfil={perfil} materia={materia} onMateria={cambiarMateria} />;
  const aviso = levelUp && (
    <div className="level-up" role="status" aria-live="polite">
      <div className="level-up-flash" />
      <div className="level-up-contenido px">
        <Hada nombre={perfil.avatar} secuencia="nivel" />
        <Bocadillo texto="¡LEVEL UP!" />
      </div>
    </div>
  );
  return (
    <Aparato
      superposicion={aviso}
      barra={{ nivel: prog.nivel, dominadas: prog.dominadas, total: PREGUNTAS.length, modoColor, onModoColor, materia, onMateria: cambiarMateria }}
      id="contenido"
      ruta={ruta}
      ir={ir}
    >
      {vista}
    </Aparato>
  );
}

// Flujo general: bienvenida → hada → materia → app. La barra de las pantallas previas muestra el nivel
// y la batería de la última materia usada (o de PE, vacía, si todavía no hay progreso).
export default function App() {
  const [perfil, setPerfilState] = useState(() => normalizarPerfil(leerJSON(CLAVES.perfil)));
  const [materia, setMateriaState] = useState(materiaGuardada);
  const [seleccionando, setSeleccionando] = useState(() => !materiaGuardada());
  const [modoColor, alternarModoColor] = useModoColor();
  const { ruta, hash, ir } = useRuta();
  const ultimaMateria = useRef(materia);
  if (materia) ultimaMateria.current = materia;
  const importar = ruta === "importar";
  const setPerfil = (p) => { const limpio = normalizarPerfil(p); setPerfilState(limpio); if (limpio) escribirJSON(CLAVES.perfil, limpio); };
  const elegir = (m) => { setMateriaState(m); setSeleccionando(false); escribirTexto(CLAVES.materiaActiva, m); location.hash = "/"; };
  const abrirSelector = () => { setMateriaState(null); setSeleccionando(true); };
  const previo = importar || !perfil || seleccionando || !materia;

  let contenido;
  if (previo) {
    const mostrada = materia || ultimaMateria.current || "PE";
    const { nivel, dominadas, total } = resumenMateria(mostrada);
    contenido = (
      <Aparato
        barra={{ nivel, dominadas, total, modoColor, onModoColor: alternarModoColor, materia: mostrada, onMateria: () => {} }}
        sola={!importar}
        bloqueada
      >
        {importar ? <Importar key={hash} onListo={(p) => { setPerfil(p); abrirSelector(); location.hash = "/materias"; }} />
          : !perfil ? <Bienvenida onContinuar={(p) => { setPerfil(p); setSeleccionando(true); }} />
          : <Materias perfil={perfil} onElegir={elegir} />}
      </Aparato>
    );
  } else {
    // key: cada materia empieza con las vistas limpias (práctica y simulacro en curso, aviso de nivel); el contenido
    // y el progreso ya no dependen de ella.
    contenido = (
      <ContenidoProvider materia={materia}>
        <Aplicacion key={materia} perfil={perfil} setPerfil={setPerfil} materia={materia} setMateria={abrirSelector} ruta={ruta} ir={ir} modoColor={modoColor} onModoColor={alternarModoColor} />
      </ContenidoProvider>
    );
  }
  return (
    <div className="mesa">
      <AvisoAlmacenamiento />
      {contenido}
    </div>
  );
}

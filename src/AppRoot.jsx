import { useEffect, useRef, useState } from "react";
import BarraEstado from "./components/BarraEstado.jsx";
import Navegacion from "./components/Navegacion.jsx";
import Inicio from "./views/Inicio.jsx";
import Temas from "./views/Temas.jsx";
import Tema from "./views/Tema.jsx";
import Simulacro from "./views/Simulacro.jsx";
import Progreso from "./views/Progreso.jsx";
import Bienvenida from "./views/Bienvenida.jsx";
import Materias from "./views/Materias.jsx";
import Importar from "./views/Importar.jsx";
import ElegirHada from "./views/ElegirHada.jsx";
import { useProgreso } from "./lib/progreso.js";
import { PREGUNTAS, usarMateria } from "./data/contenido.js";
import Bocadillo from "./components/Bocadillo.jsx";
import Hada from "./components/Hada.jsx";
import AvisoAlmacenamiento from "./components/AvisoAlmacenamiento.jsx";
import { CLAVES, escribirJSON, escribirTexto, leerJSON, leerTexto, quitar } from "./lib/almacenamiento.js";

const leerRuta = () => location.hash.replace(/^#\/?/, "").split("?")[0] || "";
const temaInicial = () => leerTexto(CLAVES.tema) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

function Aplicacion({ perfil, setPerfil, materia, setMateria }) {
  usarMateria(materia);
  const [ruta, setRuta] = useState(leerRuta);
  const [tema, setTema] = useState(temaInicial);
  const [levelUp, setLevelUp] = useState(false);
  const nivelAnterior = useRef(null);
  const prog = useProgreso(materia);
  useEffect(() => {
    const h = () => { setRuta(leerRuta()); window.scrollTo(0, 0); };
    addEventListener("hashchange", h); return () => removeEventListener("hashchange", h);
  }, []);
  useEffect(() => document.documentElement.setAttribute("data-theme", tema), [tema]);
  useEffect(() => {
    if (nivelAnterior.current === null) { nivelAnterior.current = prog.nivel; return; }
    if (prog.nivel > nivelAnterior.current) {
      setLevelUp(true);
      const id = setTimeout(() => setLevelUp(false), 1800);
      nivelAnterior.current = prog.nivel;
      return () => clearTimeout(id);
    }
    nivelAnterior.current = prog.nivel;
  }, [prog.nivel]);
  const ir = (r) => { location.hash = r ? `/${r}` : "/"; };
  const cambiarTema = () => {
    const t = tema === "dark" ? "light" : "dark"; setTema(t); escribirTexto(CLAVES.tema, t);
  };
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
    onElegir={(id) => { setPerfil({ ...perfil, avatar: id, hada: id }); ir(""); }}
  />;
  else if (base === "progreso") vista = <Progreso prog={prog} ir={ir} perfil={perfil} setPerfil={setPerfil} materia={materia} />;
  else vista = <Inicio prog={prog} ir={ir} perfil={perfil} materia={materia} onMateria={cambiarMateria} />;
  return <>
    {levelUp && <div className="level-up" role="status" aria-live="polite">
      <div className="level-up-flash" />
      <div className="level-up-contenido px">
        <Hada nombre={perfil.avatar} secuencia="nivel" />
        <Bocadillo texto="¡LEVEL UP!" />
      </div>
    </div>}
    <BarraEstado nivel={prog.nivel} dominadas={prog.dominadas} total={PREGUNTAS.length} tema={tema} onTema={cambiarTema} materia={materia} onMateria={cambiarMateria} />
    <main className="pantalla" id="contenido">{vista}</main>
    <Navegacion ruta={ruta} ir={ir} />
  </>;
}

export default function App() {
  const [perfil, setPerfilState] = useState(() => leerJSON(CLAVES.perfil));
  const [materia, setMateriaState] = useState(() => leerTexto(CLAVES.materiaActiva));
  const [seleccionando, setSeleccionando] = useState(() => !leerTexto(CLAVES.materiaActiva));
  const [temaPrevio, setTemaPrevio] = useState(temaInicial);
  const importar = leerRuta() === "importar";
  useEffect(() => document.documentElement.setAttribute("data-theme", temaPrevio), [temaPrevio]);
  const setPerfil = (p) => { setPerfilState(p); escribirJSON(CLAVES.perfil, p); };
  const elegir = (m) => { setMateriaState(m); setSeleccionando(false); escribirTexto(CLAVES.materiaActiva, m); location.hash = "/"; };
  const abrirSelector = () => { setMateriaState(null); setSeleccionando(true); };
  const previo = importar || !perfil || seleccionando || !materia;
  const cambiarTemaPrevio = () => {
    const siguiente = temaPrevio === "dark" ? "light" : "dark";
    setTemaPrevio(siguiente);
    escribirTexto(CLAVES.tema, siguiente);
  };
  return (
    <div className="mesa">
      <AvisoAlmacenamiento />
      <div className="aparato">
        {previo && <BarraEstado nivel={1} dominadas={0} total={PREGUNTAS.length} tema={temaPrevio} onTema={cambiarTemaPrevio} materia={materia || "PE"} onMateria={() => {}} />}
        {importar ? <main className="pantalla"><Importar onListo={(p) => { setPerfil(p); abrirSelector(); location.hash = "/materias"; }} /></main>
          : !perfil ? <main className="pantalla pantalla-sola"><Bienvenida onContinuar={(p) => { setPerfil(p); setSeleccionando(true); }} /></main>
          : seleccionando || !materia ? <main className="pantalla pantalla-sola"><Materias perfil={perfil} onElegir={elegir} /></main>
          : <Aplicacion key={materia} perfil={perfil} setPerfil={setPerfil} materia={materia} setMateria={abrirSelector} />}
        {previo && <Navegacion ruta="" ir={() => {}} bloqueada />}
      </div>
      <footer className="pie"><span aria-hidden="true">✦</span> tamagotchigirls 2026</footer>
    </div>
  );
}

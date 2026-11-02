import { useState } from "react";
import { useContenido } from "../data/ContenidoContext.jsx";
import { temaSiguiente, textoNumeroDeTema } from "../lib/conteos.js";
import { secuenciaDeRespuesta, usePractica } from "../lib/usePractica.js";
import ZonaEscena from "../components/ZonaEscena.jsx";
import Encabezado from "../components/Encabezado.jsx";
import TemaApuntes from "./tema/TemaApuntes.jsx";
import TemaPractica from "./tema/TemaPractica.jsx";
import TemaResultado from "./tema/TemaResultado.jsx";

export default function Tema({ id, prog, ir, perfil }) {
  const { TEMAS } = useContenido();
  const tema = TEMAS.find(t => t.id === id);
  if (!tema) return <div className="vista"><p>Ese tema no existe.</p><button className="btn px" onClick={() => ir("temas")}>Ver temas</button></div>;
  return <TemaVista tema={tema} prog={prog} ir={ir} perfil={perfil} />;
}

function TemaVista({ tema, prog, ir, perfil }) {
  const { TEMAS } = useContenido();
  const [pestana, setPestana] = useState("apuntes");
  const [pagina, setPagina] = useState(0);
  const p = usePractica(tema, prog);

  const verApuntes = () => { setPestana("apuntes"); p.repetir(); };
  const pestanaClase = (nombre) => `pestana px ${pestana === nombre ? "on" : ""}`;

  return (
    <div className="vista">
      <ZonaEscena
        hada={perfil.avatar}
        dia={prog.racha}
        compacto
        secuencia={secuenciaDeRespuesta(p.actual, p.seleccion)}
      />
      <button className="volver" onClick={() => ir("temas")}>← Temas</button>
      <Encabezado eyebrow={textoNumeroDeTema(tema.id, TEMAS)} titulo={tema.nombre} />

      <div className="pestanas" role="tablist">
        <button role="tab" aria-selected={pestana === "apuntes"} className={pestanaClase("apuntes")} onClick={() => setPestana("apuntes")}>Apuntes</button>
        <button role="tab" aria-selected={pestana === "practicar"} className={pestanaClase("practicar")} onClick={() => setPestana("practicar")}>Practicar</button>
      </div>

      {pestana === "apuntes" && (
        <TemaApuntes tema={tema} pagina={pagina} onPagina={setPagina} onPracticar={() => setPestana("practicar")} />
      )}
      {pestana === "practicar" && !p.terminado && <TemaPractica p={p} />}
      {pestana === "practicar" && p.terminado && (
        <TemaResultado
          aciertos={p.aciertos}
          total={p.reactivos.length}
          medalla={p.medalla}
          siguienteTema={temaSiguiente(TEMAS, tema.id)}
          ir={ir}
          onVerApuntes={verApuntes}
          onRepetir={p.repetir}
        />
      )}
    </div>
  );
}

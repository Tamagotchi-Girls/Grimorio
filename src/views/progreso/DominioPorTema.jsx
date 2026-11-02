import { useContenido } from "../../data/ContenidoContext.jsx";
import FilaTema from "../../components/FilaTema.jsx";
import Pips from "../../components/Pips.jsx";

export default function DominioPorTema({ prog, ir }) {
  const { TEMAS } = useContenido();
  return (
    <section className="por-tema px"><h2 className="sub">Dominio por tema</h2>
      {TEMAS.map((t) => {
        const { ok, total } = prog.resumenTema(t.id);
        return (
          <FilaTema key={t.id} tema={t} conteo={`${ok}/${total}`} onClick={() => ir(`tema/${t.id}`)}>
            <Pips estados={prog.estadoTema(t.id)} etiqueta={`${ok} de ${total}`} />
          </FilaTema>
        );
      })}
    </section>
  );
}

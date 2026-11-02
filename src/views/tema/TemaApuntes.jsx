import Bocadillo from "../../components/Bocadillo.jsx";
import Codigo from "../../components/Codigo.jsx";

export default function TemaApuntes({ tema, pagina, onPagina, onPracticar }) {
  const ultima = tema.apuntes.length - 1;
  return (
    <section className="apuntes px">
      <h2 className="sub">Lo que tienes que saber</h2>
      <Bocadillo texto={tema.apuntes[pagina]} className="apunte-dialogo" />
      <div className="paginacion-apuntes" aria-label="Páginas de apuntes">
        <button className="btn px" disabled={pagina === 0} onClick={() => onPagina(pagina - 1)}>◀</button>
        <span>{pagina + 1} / {tema.apuntes.length}</span>
        <button className="btn px" disabled={pagina === ultima} onClick={() => onPagina(pagina + 1)}>▶</button>
      </div>
      <h2 className="sub">Ejemplo</h2>
      <Codigo codigo={tema.ejemplo} />
      <button className="btn grande px pink" onClick={onPracticar}>Practicar este tema →</button>
    </section>
  );
}

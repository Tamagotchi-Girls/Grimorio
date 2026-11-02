const fmt = (iso) => {
  try { return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

// `simulacros` en el orden en que se guardaron; se muestran del más reciente al más antiguo.
export default function HistorialSimulacros({ simulacros, onHacerPrimero }) {
  const recientes = [...simulacros].reverse();
  return (
    <section className="historial px"><h2 className="sub">Historial de simulacros</h2>
      {recientes.length === 0
        ? <p className="nota">Aún no haces simulacros. <button className="btn-texto" onClick={onHacerPrimero}>Hacer el primero →</button></p>
        : <ol>{recientes.map((s, k) => <li key={k}><span>{fmt(s.fecha)}</span><span className="h-barra"><i style={{ width: `${s.calificacion}%` }} /></span><b>{s.calificacion}</b></li>)}</ol>}
    </section>
  );
}

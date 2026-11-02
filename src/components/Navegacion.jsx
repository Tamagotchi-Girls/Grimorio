import Sprite from "./Sprite.jsx";

const ITEMS = [
  { ruta: "", label: "INICIO", sprite: "casita", color: "mint" },
  { ruta: "simulacro", label: "EXAMEN", sprite: "corazon", color: "pink" },
  { ruta: "temas", label: "REPASO", sprite: "libro", color: "mint" },
  { ruta: "progreso", label: "LOGROS", sprite: "estrellaVerde", color: "lav" }
];

export default function Navegacion({ ruta, ir, bloqueada = false }) {
  const base = ruta.split("/")[0] === "tema" ? "temas" : ruta.split("/")[0];
  return (
    <nav className="nav" aria-label="Secciones">
      {ITEMS.map(it => (
        <button
          key={it.label}
          className={`nav-btn ${it.color} ${base === it.ruta ? "activo" : ""}`}
          aria-current={base === it.ruta ? "page" : undefined}
          disabled={bloqueada}
          onClick={() => ir(it.ruta)}
        >
          <span className="nav-icono px"><Sprite nombre={it.sprite} escala={3} /></span>
          <span className="nav-label">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

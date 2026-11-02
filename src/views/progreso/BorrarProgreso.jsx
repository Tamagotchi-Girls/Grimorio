import { useState } from "react";
import Confirmar from "../../components/Confirmar.jsx";

export default function BorrarProgreso({ materia, onBorrar }) {
  const [pidiendo, setPidiendo] = useState(false);
  const confirmar = () => { onBorrar(); setPidiendo(false); };
  return (
    <div className="reinicio">
      {!pidiendo
        ? <button className="btn-texto" onClick={() => setPidiendo(true)}>Borrar progreso de {materia}</button>
        : (
          <Confirmar
            textoCancelar="Cancelar"
            onCancelar={() => setPidiendo(false)}
            textoConfirmar="Sí, borrar"
            onConfirmar={confirmar}
            claseConfirmar="btn pink px"
          >
            <p>Se borrarán nivel, dominio y simulacros de esta materia. No se puede deshacer.</p>
          </Confirmar>
        )}
    </div>
  );
}

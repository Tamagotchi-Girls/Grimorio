// El texto escrito vive en quien lo usa (Progreso), para que no se pierda al cerrar y abrir el formulario.
export default function FormularioNombre({ nombre, onNombre, onGuardar, onCancelar }) {
  return (
    <form className="perfil-form compacto px" onSubmit={onGuardar}>
      <label className="campo"><span>Nombre</span><input value={nombre} onChange={(e) => onNombre(e.target.value)} maxLength={32} /></label>
      <div className="acciones"><button className="btn px" type="button" onClick={onCancelar}>Cancelar</button><button className="btn pink px" type="submit">Guardar cambios</button></div>
    </form>
  );
}

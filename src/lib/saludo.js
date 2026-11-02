// Saludo de la portada según la hora: antes de las 12 "días", antes de las 19 "tardes", después "noches".
export function saludoSegunHora(fecha) {
  const h = fecha.getHours();
  return h < 12 ? "¡Buenos días!" : h < 19 ? "¡Buenas tardes!" : "¡Buenas noches!";
}

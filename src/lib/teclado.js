// Teclas numéricas para responder: 1 es la primera opción, y así hasta la última del reactivo.

// Índice (desde 0) de la opción que corresponde a la tecla, o null si no es una opción de este reactivo.
export function indiceDeTecla(tecla, totalOpciones) {
  const n = parseInt(tecla, 10);
  return n >= 1 && n <= totalOpciones ? n - 1 : null;
}

export const textoTeclas = (totalOpciones) => `Teclas 1–${totalOpciones} para responder`;

// ¿El evento viene de un campo donde se escribe (o de un radio de opciones)? Tema ignora las teclas ahí.
export const enCampo = (e) => !!(e.target.closest && e.target.closest("input, textarea"));

// Medalla que se muestra al terminar un tema o un simulacro: "copa", "estrella" o "corazon".
// Cada medalla se gana al llegar a su umbral (en porcentaje, ambos incluidos).

// Simulacro: por la calificación ya redondeada (0–100).
export const UMBRALES_SIMULACRO = Object.freeze({ copa: 90, estrella: 60 });

// Tema: copa solo con todos los reactivos bien; estrella con dos tercios o más. Los temas tienen 6
// reactivos, así que 2/3 son 4 aciertos: es la regla `aciertos >= 4` de antes, dicha en proporción.
// 200 / 3 (y no (2 / 3) * 100) para que dé el mismo flotante que (100 * 4) / 6.
export const UMBRALES_TEMA = Object.freeze({ copa: 100, estrella: 200 / 3 });

export function medallaPorPorcentaje(porcentaje, umbrales) {
  if (porcentaje >= umbrales.copa) return "copa";
  if (porcentaje >= umbrales.estrella) return "estrella";
  return "corazon";
}

export const medallaDeSimulacro = (calificacion) => medallaPorPorcentaje(calificacion, UMBRALES_SIMULACRO);

// Un tema sin reactivos no tiene nada que fallar: copa (igual que cuando se comparaba `aciertos === total`).
export const medallaDeTema = (aciertos, total) =>
  medallaPorPorcentaje(total ? (100 * aciertos) / total : 100, UMBRALES_TEMA);

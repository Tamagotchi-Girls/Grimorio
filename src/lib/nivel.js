// Reglas de XP y nivel en un solo lugar: ningún otro módulo divide entre 100 ni multiplica por 10.
export const XP_POR_ACIERTO = 10;
export const XP_POR_NIVEL = 100;

// xp inválido (undefined, NaN, negativo) cuenta como 0; los decimales se truncan.
const xpValido = (xp) => Math.max(0, Math.floor(Number(xp) || 0));

// Nivel actual (empieza en 1).
export const nivelDe = (xp) => 1 + Math.floor(xpValido(xp) / XP_POR_NIVEL);

// XP acumulado dentro del nivel actual: 0 … XP_POR_NIVEL - 1.
export const xpEnNivel = (xp) => xpValido(xp) % XP_POR_NIVEL;

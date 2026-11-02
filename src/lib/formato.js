// Número con al menos dos dígitos: 3 → "03", 12 → "12".
export const dosDigitos = (n) => String(n).padStart(2, "0");

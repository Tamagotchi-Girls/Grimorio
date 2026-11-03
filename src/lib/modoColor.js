import { useCallback, useEffect, useState } from "react";
import { CLAVES, escribirTexto, leerTexto } from "./almacenamiento.js";

// Lo guardado manda; si no hay nada (o es inválido), el que prefiera el sistema.
export const modoColorInicial = () => {
  const guardado = leerTexto(CLAVES.modoColor);
  return guardado === "dark" || guardado === "light" ? guardado : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Un solo estado claro/oscuro para toda la app. Devuelve [modoColor, alternar]; alternar también lo guarda.
export function useModoColor() {
  const [modoColor, setModoColor] = useState(modoColorInicial);
  useEffect(() => document.documentElement.setAttribute("data-theme", modoColor), [modoColor]);
  const alternar = useCallback(() => {
    const siguiente = modoColor === "dark" ? "light" : "dark";
    setModoColor(siguiente);
    escribirTexto(CLAVES.modoColor, siguiente);
  }, [modoColor]);
  return [modoColor, alternar];
}

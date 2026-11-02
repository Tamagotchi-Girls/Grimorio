import { useCallback, useEffect, useState } from "react";
import { CLAVES, escribirTexto, leerTexto } from "./almacenamiento.js";

// Lo guardado manda; si no hay nada (o es inválido), el que prefiera el sistema.
export const temaInicial = () => {
  const guardado = leerTexto(CLAVES.tema);
  return guardado === "dark" || guardado === "light" ? guardado : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Un solo estado claro/oscuro para toda la app. Devuelve [tema, alternar]; alternar también lo guarda.
export function useTema() {
  const [tema, setTema] = useState(temaInicial);
  useEffect(() => document.documentElement.setAttribute("data-theme", tema), [tema]);
  const alternar = useCallback(() => {
    const siguiente = tema === "dark" ? "light" : "dark";
    setTema(siguiente);
    escribirTexto(CLAVES.tema, siguiente);
  }, [tema]);
  return [tema, alternar];
}

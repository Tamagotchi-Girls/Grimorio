import { useSyncExternalStore } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";
const consulta = () => { try { return matchMedia(CONSULTA); } catch { return null; } };

export const movimientoReducido = () => consulta()?.matches ?? false;

function suscribir(avisar) {
  const mql = consulta();
  mql?.addEventListener?.("change", avisar);
  return () => mql?.removeEventListener?.("change", avisar);
}

// true si la persona pidió menos movimiento; se actualiza si cambia la preferencia con la app abierta.
export const useMovimientoReducido = () => useSyncExternalStore(suscribir, movimientoReducido, () => false);

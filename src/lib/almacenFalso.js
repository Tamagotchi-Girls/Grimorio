// Ayuda para pruebas: un localStorage en memoria cuyo `setItem` se puede espiar (el de happy-dom no se deja).
import { vi } from "vitest";

export function instalarAlmacenFalso() {
  const datos = new Map();
  const almacen = {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: vi.fn((k, v) => { datos.set(k, String(v)); }),
    removeItem: (k) => { datos.delete(k); },
    clear: () => datos.clear(),
  };
  vi.stubGlobal("localStorage", almacen);
  return almacen;
}

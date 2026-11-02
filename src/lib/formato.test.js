import { describe, expect, it } from "vitest";
import { dosDigitos } from "./formato.js";

describe("dosDigitos", () => {
  it("rellena con un cero a la izquierda", () => {
    expect(dosDigitos(0)).toBe("00");
    expect(dosDigitos(3)).toBe("03");
    expect(dosDigitos(9)).toBe("09");
  });
  it("no recorta números de dos o más dígitos", () => {
    expect(dosDigitos(10)).toBe("10");
    expect(dosDigitos(59)).toBe("59");
    expect(dosDigitos(100)).toBe("100");
  });
});

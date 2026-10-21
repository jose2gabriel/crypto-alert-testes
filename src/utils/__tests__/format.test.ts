import { formatChange, formatPrice } from "@utils/index";

describe("formatadores", () => {
  it("formatPrice formata com separador de milhar e respeita casas decimais, inclusive zero e NaN", () => {
    expect(formatPrice(67999.5)).toBe("67,999.50");
    expect(formatPrice(0)).toBe("0.00");
    expect(formatPrice(0.123456, 4)).toBe("0.1235");
    expect(formatPrice(Number.NaN)).toBe("NaN");
  });

  it("formatChange adiciona sinal + para valores positivos e zero, e mantém o - nos negativos", () => {
    expect(formatChange(2.456)).toBe("+2.46%");
    expect(formatChange(0)).toBe("+0.00%");
    expect(formatChange(-1.23)).toBe("-1.23%");
  });
});

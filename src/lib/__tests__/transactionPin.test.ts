import {
  isValidTransactionPin,
  normalizeTransactionPin,
  TRANSACTION_PIN_LENGTH,
} from "../transactionPin";

describe("transactionPin", () => {
  it("normalizes to digits only up to 4 characters", () => {
    expect(normalizeTransactionPin("12ab34cd56")).toBe("1234");
    expect(normalizeTransactionPin("")).toBe("");
  });

  it("validates exactly 4 digits", () => {
    expect(isValidTransactionPin("1234")).toBe(true);
    expect(isValidTransactionPin("123")).toBe(false);
    expect(isValidTransactionPin("12345")).toBe(false);
    expect(isValidTransactionPin("12a4")).toBe(false);
  });

  it("uses a 4-digit length constant", () => {
    expect(TRANSACTION_PIN_LENGTH).toBe(4);
  });
});

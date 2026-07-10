import {
  koboToNaira,
  nairaToKobo,
  readKoboAsNaira,
} from "../money";

describe("money", () => {
  it("converts naira to kobo for API writes", () => {
    expect(nairaToKobo(500)).toBe(50_000);
    expect(nairaToKobo(50_000)).toBe(5_000_000);
  });

  it("converts kobo to naira for in-app use", () => {
    expect(koboToNaira(50_000)).toBe(500);
    expect(koboToNaira(5_000_000)).toBe(50_000);
  });

  it("reads API kobo fields as naira", () => {
    expect(readKoboAsNaira(5_000_000)).toBe(50_000);
    expect(readKoboAsNaira("50000")).toBe(500);
  });
});

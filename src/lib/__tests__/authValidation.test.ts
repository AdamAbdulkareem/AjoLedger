import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "../authValidation";
import { parseAuthData } from "../schemas/apiSchemas";

describe("authValidation", () => {
  it("validates email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("validates password length", () => {
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("short")).toBe(false);
  });

  it("normalizes email", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});

describe("parseAuthData", () => {
  it("parses valid auth payloads", () => {
    expect(
      parseAuthData({
        accessToken: "token-123",
        user: { id: "user-1", email: "user@example.com" },
      }),
    ).toEqual({
      accessToken: "token-123",
      user: { id: "user-1", email: "user@example.com" },
    });
  });

  it("rejects invalid auth payloads", () => {
    expect(() =>
      parseAuthData({
        accessToken: "",
        user: { id: "user-1", email: "bad-email" },
      }),
    ).toThrow();
  });
});

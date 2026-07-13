import { splitFullName, joinFullName } from "../nameUtils";

describe("nameUtils", () => {
  it("splits full name into first and last", () => {
    expect(splitFullName("Adam Abdul")).toEqual({
      firstName: "Adam",
      lastName: "Abdul",
    });
  });

  it("joins first and last name", () => {
    expect(joinFullName("Adam", "Abdul")).toBe("Adam Abdul");
  });
});

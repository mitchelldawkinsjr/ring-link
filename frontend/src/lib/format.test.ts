import { describe, expect, it } from "vitest";
import { formatRole } from "./format";

describe("formatRole", () => {
  it("title-cases known roles", () => {
    expect(formatRole("wrestler")).toBe("Wrestler");
    expect(formatRole("promotion")).toBe("Promotion");
  });
});

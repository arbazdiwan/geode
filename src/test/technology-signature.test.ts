import { describe, expect, it } from "vitest";
import { infusionSvg, signatureLayers, telemetryFor, toggleTechnology, TECHNOLOGIES } from "@/lib/technology-signature";

describe("Two-layer technology signature", () => {
  it("allows no more than three technologies", () => {
    expect(toggleTechnology(["ml", "cloud", "backend"], "security")).toEqual(["ml", "cloud", "backend"]);
  });
  it("allows deselection when three are selected", () => {
    expect(toggleTechnology(["ml", "cloud", "backend"], "cloud")).toEqual(["ml", "backend"]);
  });
  it("keeps one dominant effect and up to two subtle effects", () => {
    expect(signatureLayers(["ml", "cloud", "backend"]).map((l) => l.strength)).toEqual([0.85, 0.32, 0.32]);
  });
  it("updates readings with the base and signature independently", () => {
    expect(telemetryFor("4.0", ["ml"]).map((s) => s.value)).toEqual([50, 47, 40]);
    expect(telemetryFor("7.0", ["ml"]).map((s) => s.value)).toEqual([56, 56, 46]);
    expect(telemetryFor("4.0", []).map((s) => s.value)).toEqual([32, 42, 28]);
  });
  it("exports a distinct infusion for all eight technology choices", () => {
    const outputs = TECHNOLOGIES.map((t) => infusionSvg([t.id], { [t.token]: "oklch(0.8 0.1 100)" }));
    expect(new Set(outputs).size).toBe(8);
    expect(infusionSvg([])).not.toContain("<g");
  });
});
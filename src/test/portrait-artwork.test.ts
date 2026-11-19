import { describe, expect, it } from "vitest";
import { metallicPixel, portraitSettingsSchema, validatePhoto, sculptedLight } from "@/lib/portrait-artwork";
import { subjectAlpha } from "@/lib/portrait-segmentation";

describe("local metallic portraits", () => {
  it("removes the background and preserves the confident subject", () => {
    expect(subjectAlpha(.1)).toBe(0);
    expect(subjectAlpha(.95)).toBe(1);
    expect(subjectAlpha(.5)).toBeGreaterThan(0);
    expect(subjectAlpha(.5)).toBeLessThan(1);
  });
  it("lights opposing surface edges differently and adds highlights", () => {
    expect(sculptedLight(-.2, -.1, .9).relief).toBeGreaterThan(0);
    expect(sculptedLight(.2, .1, .9).relief).toBeLessThan(0);
    expect(sculptedLight(0, 0, .9).specular).toBeGreaterThan(sculptedLight(0, 0, .2).specular);
  });
  it("maps photo shadows and highlights to the metal palette", () => {
    expect(metallicPixel([0, 0, 0], [20, 10, 5], [180, 100, 50], [255, 230, 200], 1)).toEqual([20, 10, 5]);
    expect(metallicPixel([255, 255, 255], [20, 10, 5], [180, 100, 50], [255, 230, 200], 1)).toEqual([255, 230, 200]);
  });
  it("retains the original photo at zero finish strength", () => {
    expect(metallicPixel([48, 122, 210], [0, 0, 0], [100, 50, 20], [255, 255, 255], 0)).toEqual([48, 122, 210]);
  });
  it("rejects files that are not supported raster photos", () => {
    expect(() => validatePhoto({ type: "image/svg+xml", size: 120 })).toThrow();
    expect(() => validatePhoto({ type: "image/jpeg", size: 120 })).not.toThrow();
  });
  it("rejects unsafe crop adjustments", () => {
    expect(portraitSettingsSchema.safeParse({ zoom: -1, x: 0, y: 0, strength: 1 }).success).toBe(false);
  });
});
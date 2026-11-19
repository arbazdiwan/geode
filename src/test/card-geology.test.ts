import { describe, expect, it } from "vitest";
import { SPECIMENS, geologyFor } from "@/lib/specimens";

describe("Geological card specifications", () => {
  it("identifies copper as a base metal on the Mohs scale", () => {
    const specimen = SPECIMENS.find((s) => s.id === "copper");
    if (!specimen) throw new Error("Missing copper specimen");
    expect(geologyFor(specimen)).toEqual({ symbol: "Cu", element: "COPPER", type: "Base Metal", hardness: "2.5–3.0", origin: "Sudbury Basin" });
  });
  it("retains nickel and meteoric iron element identities", () => {
    expect(SPECIMENS.filter((s) => ["nickel", "iron"].includes(s.id)).map((s) => geologyFor(s).symbol)).toEqual(["Ni", "Fe"]);
  });
  it("gives every specimen separate geological collection specifications", () => {
    expect(SPECIMENS.map((s) => geologyFor(s).origin)).toEqual(Array(6).fill("Sudbury Basin"));
    expect(SPECIMENS.map((s) => geologyFor(s).type)).toEqual(["Base Metal", "Base Metal", "Silicate", "Feldspar", "Iron Meteorite", "Silicate"]);
  });
});
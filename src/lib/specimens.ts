import nickel from "@/assets/nickel.jpg";
import copper from "@/assets/copper.jpg";
import amethyst from "@/assets/amethyst.jpg";
import labradorite from "@/assets/labradorite.jpg";
import meteorite from "@/assets/meteorite.jpg";
import quartz from "@/assets/quartz.jpg";

export type Specimen = {
  id: string;
  code: string;
  name: string;
  tags: string;
  role: string;
  blurb: string;
  material: string;
  image: string;
  /** accent colour, used for glow and canvas export */
  accent: string;
  accent2: string;
  hardness: string;
};

export const SPECIMENS: Specimen[] = [
  { id: "nickel", code: "NI-28", name: "Nickel Core", tags: "Backend · Systems", role: "The Foundation",
    blurb: "Infrastructure, databases, APIs and distributed systems.", material: "Metallic silver · Cyan energy",
    image: nickel, accent: "#5ee7f2", accent2: "#c9d3dc", hardness: "4.0" },
  { id: "copper", code: "CU-29", name: "Copper Circuit", tags: "Cloud · Networks", role: "The Connector",
    blurb: "Cloud infrastructure, networking and DevOps.", material: "Burnished copper · Amber glow",
    image: copper, accent: "#ff9a4d", accent2: "#e0703a", hardness: "3.0" },
  { id: "crystal", code: "SIO-AM", name: "Crystal Intelligence", tags: "ML · Data", role: "The Intelligence",
    blurb: "Machine learning and data science.", material: "Amethyst · Violet glow",
    image: amethyst, accent: "#c08bff", accent2: "#8a4dff", hardness: "7.0" },
  { id: "aurora", code: "LB-AU", name: "Aurora Shard", tags: "Design · Frontend", role: "The Interface",
    blurb: "User experience, frontend and creative development.", material: "Labradorite · Aurora blue & teal",
    image: labradorite, accent: "#4fd1ff", accent2: "#f5c451", hardness: "6.5" },
  { id: "iron", code: "FE-MT", name: "Meteoric Iron", tags: "Security · Engineering", role: "The Protector",
    blurb: "Cybersecurity, reliability and engineering.", material: "Meteoric iron · Graphite & silver",
    image: meteorite, accent: "#d9dde2", accent2: "#8a9099", hardness: "5.5" },
  { id: "quartz", code: "SIO-QZ", name: "Quartz Frequency", tags: "Creators · Innovators", role: "The Signal",
    blurb: "Startups, experimentation and emerging technologies.", material: "Quartz · Ice blue & white",
    image: quartz, accent: "#a8f0ff", accent2: "#5cff9d", hardness: "7.0" },
];

export const TECH = ["Android", "Flutter", "Firebase", "Google Cloud", "Gemini", "TensorFlow", "Kotlin", "Go",
  "Angular", "Web", "Python", "Rust", "TypeScript", "Kubernetes", "Security", "UX Design", "Data", "Startups"];

const GEOLOGY: Record<string, { symbol: string; element: string; type: string; hardness: string }> = {
  nickel: { symbol: "Ni", element: "NICKEL", type: "Base Metal", hardness: "4.0" },
  copper: { symbol: "Cu", element: "COPPER", type: "Base Metal", hardness: "2.5–3.0" },
  crystal: { symbol: "SiO₂", element: "AMETHYST", type: "Silicate", hardness: "7.0" },
  aurora: { symbol: "Lb", element: "LABRADORITE", type: "Feldspar", hardness: "6.0–6.5" },
  iron: { symbol: "Fe", element: "METEORIC IRON", type: "Iron Meteorite", hardness: "4.0–5.5" },
  quartz: { symbol: "SiO₂", element: "QUARTZ", type: "Silicate", hardness: "7.0" },
};

/** Collection provenance, rather than a claim about where the pictured rock was mined. */
export function geologyFor(specimen: Specimen) {
  const entry = GEOLOGY[specimen.id] ?? { symbol: "—", element: specimen.name.toUpperCase(), type: "Mineral", hardness: specimen.hardness };
  return { ...entry, origin: "Sudbury Basin" };
}

export function serialFor(name: string, specimenId: string) {
  let h = 2166136261;
  for (const c of `${name.trim().toLowerCase()}|${specimenId}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const n = (h >>> 0) % 10000;
  return String(n).padStart(4, "0");
}

export function rarityFor(serial: string) {
  const n = Number(serial);
  if (n % 97 === 0) return "Impact Relic";
  if (n % 13 === 0) return "Shatter-Cone Rare";
  if (n % 4 === 0) return "Basin Uncommon";
  return "Field Specimen";
}

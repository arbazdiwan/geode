export const TECHNOLOGIES = [
  { id: "ml", label: "ML", effect: "Synaptic pulses", token: "signature-ml", boost: [18, 5, 12] },
  { id: "cloud", label: "Cloud", effect: "Atmospheric energy", token: "signature-cloud", boost: [8, 16, 10] },
  { id: "backend", label: "Backend", effect: "Circuit conduits", token: "signature-backend", boost: [5, 18, 9] },
  { id: "frontend", label: "Frontend", effect: "Interface lattice", token: "signature-frontend", boost: [12, 8, 15] },
  { id: "security", label: "Security", effect: "Shield etchings", token: "signature-security", boost: [4, 20, 6] },
  { id: "data", label: "Data/Analytics", effect: "Particle streams", token: "signature-data", boost: [20, 6, 8] },
  { id: "devops", label: "DevOps", effect: "Infrastructure links", token: "signature-devops", boost: [8, 15, 12] },
  { id: "design", label: "Design", effect: "Prismatic geometry", token: "signature-design", boost: [10, 5, 20] },
] as const;

export type TechnologyId = typeof TECHNOLOGIES[number]["id"];
export function toggleTechnology(selected: TechnologyId[], id: TechnologyId): TechnologyId[] {
  return selected.includes(id) ? selected.filter((t) => t !== id) : selected.length < 3 ? [...selected, id] : selected;
}
export function signatureLayers(selected: TechnologyId[]) {
  return selected.slice(0, 3).map((id, index) => ({
    technology: TECHNOLOGIES.find((t) => t.id === id),
    strength: index === 0 ? 0.85 : 0.32,
  })).filter((layer) => layer.technology !== undefined);
}
/** Fictional expedition readings, not mineral measurements or attendee rankings. */
export function telemetryFor(hardness: string, selected: TechnologyId[]) {
  const base = Number(hardness) || 0;
  const values = [Math.round(24 + base * 2), Math.round(30 + base * 3), Math.round(20 + base * 2)];
  for (const { technology } of signatureLayers(selected)) {
    technology?.boost.forEach((boost, i) => { values[i] = Math.min(99, (values[i] ?? 0) + boost); });
  }
  return [{ label: "SIGNAL", value: values[0] ?? 0 }, { label: "STABILITY", value: values[1] ?? 0 }, { label: "RESONANCE", value: values[2] ?? 0 }];
}

const path = (d: string) => `<path d="${d}"/>`;
const dot = (x: number, y: number, r = 5) => `<circle class="infusion-node" cx="${x}" cy="${y}" r="${r}"/>`;
const motifs: Record<TechnologyId, string> = {
  ml: path("M40 190L145 115L230 205L110 280L40 190 M145 115L260 65L230 205 M110 280L180 365 M770 110L875 185L950 80M875 185L940 320") + [[40,190],[145,115],[230,205],[110,280],[260,65],[180,365],[770,110],[875,185],[950,80],[940,320]].map(([x,y]) => dot(x ?? 0,y ?? 0,7)).join(""),
  backend: path("M975 120H875V270H930V390H820V470H970 M25 410H130V510H65V620H190 M860 270H800V180H735 M930 390H980") + dot(875,120,9) + dot(820,470,9) + dot(190,620,9),
  cloud: path("M20 135C80 125 60 75 130 85C160 10 240 25 270 75C330 55 350 100 410 110 M590 115C650 110 650 65 720 80C745 20 820 30 840 85C900 55 940 100 985 95 M10 160C110 150 250 170 390 140 M630 150C750 130 850 170 990 140 M45 185C130 180 220 200 305 175"),
  frontend: path("M35 50H235V175H35Z M65 80H205V145H65Z M35 225H155V345H35Z M65 255H125V315H65Z M800 320H960V445H800Z M825 345H935V420H825Z M155 225L235 175 M800 320L890 250H960"),
  security: path("M865 390L955 430V515Q955 585 865 630Q775 585 775 515V430Z M865 420L930 450V510Q930 560 865 600Q800 560 800 510V450Z M830 505L855 535L905 475 M35 75L115 45L195 75V155Q195 220 115 255Q35 220 35 155Z"),
  data: Array.from({length: 7}, (_,i) => path(`M${30+i*19} ${210+i*22}V${400+i*28}`) + Array.from({length: 4}, (_,j) => dot(30+i*19,250+j*58+i*12,3+i%3)).join("")).join("") + Array.from({length: 14},(_,i) => dot(750+i%5*42,60+Math.floor(i/5)*42,3)).join(""),
  devops: path("M30 545H210V595H360 M660 585H790V535H965 M55 90H185V40H315 M740 50H870V105H965") + [[30,545],[210,595],[360,595],[660,585],[790,535],[965,535],[55,90],[315,40],[740,50],[965,105]].map(([x,y]) => `<rect x="${(x ?? 0)-10}" y="${(y ?? 0)-10}" width="20" height="20" rx="3"/>`).join(""),
  design: path("M35 65L220 105L100 265Z M35 65L100 150L220 105 M100 150L100 265 M850 290L960 420L805 505Z M850 290L880 410L960 420 M880 410L805 505 M750 60L900 40L965 180Z"),
};

/** One vector source for the animated preview and the export's frozen infusion frame. */
export function infusionSvg(selected: TechnologyId[], colors?: Record<string, string>) {
  const layers = signatureLayers(selected).map(({technology, strength}) => {
    if (!technology) return "";
    const color = colors?.[technology.token] ?? `var(--${technology.token})`;
    return `<g class="infusion-${technology.id}" stroke="${color}" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="${strength}">${motifs[technology.id]}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 780" preserveAspectRatio="none" width="1000" height="780">${layers}</svg>`;
}
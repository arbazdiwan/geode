import type { CardData } from "./render-card";
import { geologyFor } from "./specimens";
import { infusionSvg, signatureLayers } from "./technology-signature";
import bigNickelAsset from "@/assets/big-nickel.png.asset.json";
import waterTowerAsset from "@/assets/water-tower.png.asset.json";
import scienceNorthAsset from "@/assets/science-north.png.asset.json";
import { landmarkAssets } from "./standalone-assets";

/** Sudbury landmark line art assigned to each specimen, cycling the three icons. */
// export const LANDMARKS: Record<string, { url: string; label: string }> = {
//   nickel: { url: bigNickelAsset.url, label: "Big Nickel" },
//   copper: { url: waterTowerAsset.url, label: "Sudbury water tower" },
//   crystal: { url: scienceNorthAsset.url, label: "Science North" },
//   aurora: { url: bigNickelAsset.url, label: "Big Nickel" },
//   iron: { url: waterTowerAsset.url, label: "Sudbury water tower" },
//   quartz: { url: scienceNorthAsset.url, label: "Science North" },
// };
export const LANDMARKS: Record<string, { url: string; label: string }> = {
  nickel: { url: landmarkAssets.bigNickel, label: "Big Nickel" },
  copper: { url: landmarkAssets.waterTower, label: "Sudbury water tower" },
  crystal: { url: landmarkAssets.scienceNorth, label: "Science North" },
  aurora: { url: landmarkAssets.bigNickel, label: "Big Nickel" },
  iron: { url: landmarkAssets.waterTower, label: "Sudbury water tower" },
  quartz: { url: landmarkAssets.scienceNorth, label: "Science North" },
};

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] ?? c);
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1512;

/** Identical geometry for the interactive SVG and the rasterized downloadable card. */
export function cardArtwork(d: CardData, colors?: Record<string, string>, image = d.specimen.image, landmark = LANDMARKS[d.specimen.id]?.url ?? bigNickelAsset.url) {
  const color = (token: string) => escape(colors?.[token] ?? `var(--${token})`);
  const s = d.specimen, geo = geologyFor(s);
  const a = escape(s.accent), a2 = escape(s.accent2);
  const text = (value: string, x: number, y: number, size: number, attrs = "") => `<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${escape(value)}</text>`;
  const fit = (value: string, size: number, width: number) => Math.min(size, width / Math.max(value.length * .58, 1));
  const name = d.name || "Your name", role = d.title || "DevFest Explorer";
  const mono = 'font-family="Arial, sans-serif" letter-spacing="3"';
  const stats = [["TYPE", geo.type], ["HARDNESS", geo.hardness], ["ORIGIN", geo.origin]];
  const columns = [64, 444, 758];
  let tagX = 64;
  const tags = signatureLayers(d.tech).map(({ technology }) => {
    if (!technology) return "";
    const label = technology.label.toUpperCase();
    const width = label.length * 14 + 28;
    const tag = `<g transform="translate(${tagX} 1142)"><rect width="${width}" height="36" rx="5" fill="${color("card")}" fill-opacity=".65" stroke="${color(`portrait-${s.id}-light`)}" stroke-opacity=".38" stroke-width="1"/>${text(label, width / 2, 25, 20, `text-anchor="middle" font-family="monospace" letter-spacing="2" fill="${a}" fill-opacity=".85"`)}</g>`;
    tagX += width + 12;
    return tag;
  }).join("");
  const contours = Array.from({ length: 7 }, (_, i) => `<path d="M20 ${1390 + i * 17} C120 ${1350 + i * 25} 130 ${1490 + i * 8} 250 ${1430 + i * 17} S440 ${1360 + i * 23} 560 ${1450 + i * 14} S760 ${1490 + i * 12} 860 ${1430 + i * 15} S1020 ${1430 + i * 17} 1060 ${1390 + i * 20}"/>`).join("");
  const infusion = infusionSvg(d.tech, colors).replace('width="1000" height="780"', 'x="48" y="165" width="984" height="672"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1512" viewBox="0 0 1080 1512" role="img" aria-label="${escape(`${name} — ${s.name} DevFest Sudbury collectible`)}">
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color(`portrait-${s.id}-light`)}"/><stop offset=".12" stop-color="${color(`portrait-${s.id}-metal`)}"/><stop offset=".32" stop-color="${color(`portrait-${s.id}-shadow`)}"/><stop offset=".5" stop-color="${color(`portrait-${s.id}-light`)}"/><stop offset=".68" stop-color="${color(`portrait-${s.id}-metal`)}"/><stop offset=".85" stop-color="${color(`portrait-${s.id}-shadow`)}"/><stop offset="1" stop-color="${color(`portrait-${s.id}-metal`)}"/></linearGradient>
      <linearGradient id="alcove" x2="0" y2="1"><stop offset=".8" stop-color="${color("background")}" stop-opacity="0"/><stop offset="1" stop-color="${color("background")}" stop-opacity="${d.portrait ? .4 : .95}"/></linearGradient>
      <pattern id="brush" width="6" height="4" patternUnits="userSpaceOnUse"><path d="M0 1H6" stroke="${color("metal-highlight")}" stroke-opacity=".15"/></pattern>
      <clipPath id="inside"><rect x="28" y="28" width="1024" height="1456" rx="70"/></clipPath>
      <clipPath id="art"><rect x="48" y="165" width="984" height="672" rx="55"/></clipPath>
    </defs>
    <rect x="2" y="2" width="1076" height="1508" rx="94" fill="url(#metal)" stroke="${color("metal-highlight")}" stroke-width="3"/>
    <rect x="5" y="5" width="1070" height="1502" rx="91" fill="url(#brush)"/>
    <rect x="14" y="14" width="1052" height="1484" rx="82" fill="none" stroke="${color(`portrait-${s.id}-light`)}" stroke-opacity=".38" stroke-width="2"/>
    <rect x="28" y="28" width="1024" height="1456" rx="70" fill="${color("background")}" stroke="${color(`portrait-${s.id}-shadow`)}" stroke-width="3"/>
    <g font-family="Arial, sans-serif" fill="${color("foreground")}">
      <g fill="none" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">
        <path d="M99 67L69 88L99 108" stroke="${color("brand-blue")}"/><path d="M143 67L173 88L143 108" stroke="${color("brand-green")}"/><path d="M99 67L83 78" stroke="${color("brand-red")}"/><path d="M158 98L143 108" stroke="${color("brand-yellow")}"/>
      </g>
      ${text("DevFest", 206, 84, 40, 'font-weight="600"')}${text("Sudbury", 206, 124, 40, 'font-weight="600"')}
      <path d="M422 61V129" stroke="${color("border")}" stroke-width="2"/>
      ${text("THE SUDBURY", 465, 82, 19, mono)}${text(geo.type === "Base Metal" ? "METALS COLLECTION" : "COLLECTION", 465, 114, 19, mono)}
      ${text(`No. ${d.serial.padStart(5, "0")}`, 1004, 96, 26, `text-anchor="end" ${mono}`)}
      <g clip-path="url(#art)"><image href="${escape(image)}" x="48" y="165" width="984" height="672" preserveAspectRatio="xMidYMid slice"/>${infusion}${d.portrait ? `<image data-portrait="true" href="${escape(d.portrait)}" x="48" y="165" width="984" height="672" preserveAspectRatio="none"/>` : ""}<rect x="48" y="165" width="984" height="672" fill="url(#alcove)"/></g>
      <path d="M103 165H977Q1032 165 1032 220V782Q1032 837 977 837H242V849H206V837H103Q48 837 48 782V220Q48 165 103 165Z" fill="none" stroke="${color(`portrait-${s.id}-light`)}" stroke-opacity=".55" stroke-width="2"/>
      <rect x="64" y="862" width="122" height="122" rx="12" fill="${color("card")}" stroke="${a}" stroke-width="4"/>
      ${text(geo.symbol, 125, 945, geo.symbol.length > 2 ? 42 : 66, `fill="${a}" text-anchor="middle"`)}
      ${text(geo.element, 228, 925, fit(geo.element, 62, 600), 'font-weight="600"')}${text("SUDBURY BASIN", 231, 969, 27, `fill="${color("muted-foreground")}" ${mono}`)}
      <image href="${escape(landmark)}" x="846" y="852" width="182" height="132" preserveAspectRatio="xMidYMid meet" opacity=".85" aria-label="${escape(LANDMARKS[d.specimen.id]?.label ?? "Big Nickel")} landmark"/>
      <path d="M62 1007H1018 M62 1200H1018" stroke="${color("muted-foreground")}" stroke-opacity=".5" stroke-width="2"/>
      ${text(name, 64, 1070, fit(name, 56, 595), 'font-weight="700"')}
      ${text(role, 64, 1120, fit(role, 36, 595), `fill="${color("muted-foreground")}"`)}
      ${tags}
      <path d="M696 1038V1128" stroke="${color("muted-foreground")}" stroke-opacity=".65" stroke-width="2"/>
      <g transform="translate(761 1100)" fill="none" stroke="${color("muted-foreground")}" stroke-width="3"><path d="M0 0C-22-30-20-40 0-40S22-30 0 0Z"/><circle cy="-25" r="6"/></g>
      ${text("Sudbury, ON", 811, 1069, 27, `fill="${color("muted-foreground")}"`)}${text("DevFest Attendee", 811, 1107, 25, `fill="${color("muted-foreground")}"`)}
      ${stats.map(([label, value], i) => `<g transform="translate(${columns[i]} 1250)">${text(label ?? "", 0, 0, 21, `${mono} fill="${color("muted-foreground")}"`)}${text(value ?? "", 0, 47, 33)}</g>`).join("")}
      <path d="M374 1226V1302 M705 1226V1302" stroke="${color("muted-foreground")}" stroke-opacity=".7" stroke-width="2"/>
      <g clip-path="url(#inside)" fill="none" stroke="${a}" stroke-width="1.7" opacity=".65">${contours}</g>
    </g>
  </svg>`;
}
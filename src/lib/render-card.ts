import type { Specimen } from "./specimens";
import { TECHNOLOGIES, type TechnologyId } from "./technology-signature";

import { cardArtwork, CARD_WIDTH, CARD_HEIGHT, LANDMARKS } from "./card-artwork";

export type CardData = { name: string; title: string; tech: TechnologyId[]; serial: string; rarity: string; specimen: Specimen; portrait?: string | undefined };

async function fetchAsDataUrl(url: string, what: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${what} unavailable`);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error(`${what} unavailable`));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Rasterize the same artwork used by the live card, embedding its specimen and landmark images. */
export async function renderCard(d: CardData): Promise<Blob> {
  const landmark = LANDMARKS[d.specimen.id];
  const [image, landmarkImage] = await Promise.all([
    fetchAsDataUrl(d.specimen.image, "Specimen image"),
    fetchAsDataUrl(landmark?.url ?? d.specimen.image, "Landmark image"),
  ]);
  const style = getComputedStyle(document.documentElement);
  const tokens = ["background", "foreground", "card", "border", "muted-foreground", "metal-highlight", "metal-shadow", "brand-blue", "brand-red", "brand-green", "brand-yellow", ...["shadow", "metal", "light"].map((part) => `portrait-${d.specimen.id}-${part}`), ...TECHNOLOGIES.map((t) => t.token)];
  const colors = Object.fromEntries(tokens.map((token) => [token, style.getPropertyValue(`--${token}`).trim()]));
  const svg = cardArtwork(d, colors, image, landmarkImage);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const artwork = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH; canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(artwork, 0, 0);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed")), "image/png"));
  } finally { URL.revokeObjectURL(url); }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

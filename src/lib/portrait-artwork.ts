import { z } from "zod";

export const portraitSettingsSchema = z.object({
  zoom: z.number().min(1).max(2.5),
  x: z.number().min(-100).max(100),
  y: z.number().min(-100).max(100),
  strength: z.number().min(0).max(1),
});
export type PortraitSettings = z.infer<typeof portraitSettingsSchema>;
export const DEFAULT_PORTRAIT: PortraitSettings = { zoom: 1, x: 0, y: 0, strength: 1 };

export function validatePhoto(file: Pick<File, "type" | "size">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP photo.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose a photo smaller than 20 MB.");
  if (!file.size) throw new Error("This photo is empty. Choose another photo.");
}

export function metallicPixel(rgb: number[], dark: number[], mid: number[], light: number[], strength: number) {
  const luminance = Math.min(1, Math.max(0, ((rgb[0] ?? 0) * .2126 + (rgb[1] ?? 0) * .7152 + (rgb[2] ?? 0) * .0722) / 255));
  const value = Math.min(1, Math.max(0, (luminance - .5) * 1.25 + .5));
  const low = value < .55 ? dark : mid, high = value < .55 ? mid : light;
  const mix = value < .55 ? value / .55 : (value - .55) / .45;
  return [0, 1, 2].map((i) => Math.round((rgb[i] ?? 0) * (1 - strength) + ((low[i] ?? 0) * (1 - mix) + (high[i] ?? 0) * mix) * strength));
}

/** Directional relief from luminance edges, not an invented 3D reconstruction. */
export function sculptedLight(dx: number, dy: number, luminance: number) {
  const relief = Math.max(-.28, Math.min(.28, (-dx * .8 - dy * .6) * 2.8));
  const edge = Math.min(1, Math.hypot(dx, dy) * 5);
  const specular = Math.pow(Math.max(0, luminance), 5) * .42 + edge * Math.max(0, relief) * 2.8;
  return { relief, specular };
}

function tokenRgb(token: string) {
  const canvas = document.createElement("canvas"); canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photo processing is unavailable in this browser.");
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  ctx.fillRect(0, 0, 1, 1);
  return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
}

/** One local raster layer, reused without filtering or recropping in either card output. */
export async function createPortrait(source: string, specimenId: string, input: PortraitSettings) {
  const settings = portraitSettingsSchema.parse(input);
  const img = new Image(); img.src = source; await img.decode();
  const canvas = document.createElement("canvas"); canvas.width = 984; canvas.height = 672;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Photo processing is unavailable in this browser.");
  const scale = Math.min(840 / img.naturalWidth, 658 / img.naturalHeight) * settings.zoom;
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  ctx.drawImage(img, (984 - w) / 2 + settings.x * 2, 672 - h + settings.y * 2, w, h);
  const pixels = ctx.getImageData(0, 0, 984, 672);
  const dark = tokenRgb(`--portrait-${specimenId}-shadow`), mid = tokenRgb(`--portrait-${specimenId}-metal`), light = tokenRgb(`--portrait-${specimenId}-light`);
  const luminance = new Float32Array(984 * 672);
  for (let p = 0; p < luminance.length; p++) {
    luminance[p] = ((pixels.data[p * 4] ?? 0) * .2126 + (pixels.data[p * 4 + 1] ?? 0) * .7152 + (pixels.data[p * 4 + 2] ?? 0) * .0722) / 255;
  }
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (!pixels.data[i + 3]) continue;
    const colored = metallicPixel(Array.from(pixels.data.slice(i, i + 3)), dark, mid, light, settings.strength);
    const x = (i / 4) % 984, y = Math.floor(i / 4 / 984);
    const p = i / 4;
    const dx = (luminance[y * 984 + Math.min(983, x + 2)] ?? 0) - (luminance[y * 984 + Math.max(0, x - 2)] ?? 0);
    const dy = (luminance[Math.min(671, y + 2) * 984 + x] ?? 0) - (luminance[Math.max(0, y - 2) * 984 + x] ?? 0);
    const { relief, specular } = sculptedLight(dx, dy, luminance[p] ?? 0);
    for (let c = 0; c < 3; c++) {
      const base = colored[c] ?? 0;
      pixels.data[i + c] = Math.max(0, Math.min(255, base + settings.strength * (relief * 240 + specular * ((light[c] ?? 255) - base))));
    }
    pixels.data[i + 3] = (pixels.data[i + 3] ?? 0) * Math.min(1, (672 - y) / 22);
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}
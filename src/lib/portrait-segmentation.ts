import { portraitAssets } from "./standalone-assets";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";

let engine: Promise<ImageSegmenter> | undefined;
function segmenter() {
  if (!engine) {
    engine = import("@mediapipe/tasks-vision").then(async ({ ImageSegmenter }) => {
      // Reassemble the unchanged runtime locally; parts keep source archives portable.
      const parts = await Promise.all(portraitAssets.wasmParts.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Portrait runtime unavailable.");
        return response.arrayBuffer();
      }));
      const wasmUrl = URL.createObjectURL(new Blob(parts, { type: "application/wasm" }));
      try {
        return await ImageSegmenter.createFromOptions(
          { wasmLoaderPath: portraitAssets.wasmLoaderPath, wasmBinaryPath: wasmUrl },
          { baseOptions: { modelAssetPath: portraitAssets.modelAssetPath, delegate: "CPU" }, runningMode: "IMAGE", outputConfidenceMasks: true, outputCategoryMask: false },
        );
      } finally { URL.revokeObjectURL(wasmUrl); }
    }).catch((error) => { engine = undefined; throw error; });
  }
  return engine;
}

export function subjectAlpha(confidence: number) {
  const value = Math.max(0, Math.min(1, (confidence - .25) / .55));
  return value * value * (3 - 2 * value);
}

/** Segment once per source; no photos leave the browser. */
export async function cutoutPortrait(source: string) {
  const img = new Image(); img.src = source; await img.decode();
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale); canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Photo cutout is unavailable in this browser.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const engine = await segmenter();
  const result = engine.segment(canvas);
  try {
    // The selfie model produces a single foreground-confidence mask.
    const mask = result.confidenceMasks?.[0];
    if (!mask) throw new Error("No portrait mask available.");
    const confidence = mask.getAsFloat32Array();
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const mx = Math.min(mask.width - 1, Math.floor(x / canvas.width * mask.width));
      const my = Math.min(mask.height - 1, Math.floor(y / canvas.height * mask.height));
      const alpha = subjectAlpha(confidence[my * mask.width + mx] ?? 0);
      const index = (y * canvas.width + x) * 4 + 3;
      pixels.data[index] = (pixels.data[index] ?? 0) * alpha;
      if (alpha > .8) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
    }
    if (right - left < 40 || bottom - top < 40) throw new Error("No person found. Try a clear head-and-shoulders photo.");
    ctx.putImageData(pixels, 0, 0);
    const margin = 24;
    left = Math.max(0, left - margin); top = Math.max(0, top - margin);
    right = Math.min(canvas.width, right + margin); bottom = Math.min(canvas.height, bottom + margin);
    const cropped = document.createElement("canvas"); cropped.width = right - left; cropped.height = bottom - top;
    const croppedCtx = cropped.getContext("2d");
    if (!croppedCtx) throw new Error("Photo cutout unavailable.");
    croppedCtx.drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    return cropped.toDataURL("image/png");
  } finally { result.close(); }
}
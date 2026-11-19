import type { CardData } from "./render-card";

export const SHARE_HASHTAGS = "#DevFestSudbury #DevFestSudbury2026 #GDGSudbury";

/** Pre-filled caption celebrating the minted collectible. */
export function shareCaption(d: CardData): string {
  const who = d.name.trim() || "I";
  const verb = d.name.trim() ? "just minted their" : "just minted my";
  return `${who} ${verb} ${d.specimen.name} collectible (No. ${d.serial}) for DevFest Sudbury 2026! Discover · Collect · Create. ${SHARE_HASHTAGS}`;
}

export type ShareResult = "shared" | "copied" | "unsupported";

/** One-tap native share with the PNG attached; falls back to copying the image. */
export async function shareCard(blob: Blob, d: CardData): Promise<ShareResult> {
  const file = new File([blob], `the-impact-${d.specimen.id}-${d.serial}.png`, { type: "image/png" });
  const text = shareCaption(d);
  if (typeof navigator !== "undefined" && "share" in navigator) {
    const payload: ShareData = { files: [file], text, title: "The Impact — DevFest Sudbury 2026" };
    try {
      if (!("canShare" in navigator) || navigator.canShare({ files: [file] })) {
        await navigator.share(payload);
        return "shared";
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "shared"; // user dismissed the sheet
    }
  }
  if (await copyCardImage(blob)) return "copied";
  return "unsupported";
}

/** Copy the PNG straight to the clipboard so it can be pasted into any post. */
export async function copyCardImage(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function linkedinShareUrl(origin: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(origin)}`;
}

export function xShareUrl(d: CardData): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCaption(d))}`;
}

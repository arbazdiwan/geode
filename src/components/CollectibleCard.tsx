import { useRef, type CSSProperties } from "react";
import { cardArtwork } from "@/lib/card-artwork";
import type { CardData } from "@/lib/render-card";

export function CollectibleCard({ d }: { d: CardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const s = d.specimen;
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const leave = () => { const el = ref.current; if (!el) return; el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
  return (
    <div className="card-preview [perspective:1200px]" data-testid="card-preview">
      <div ref={ref} onPointerMove={move} onPointerLeave={leave}
        style={{ "--a": s.accent, "--a2": s.accent2 } as CSSProperties}
        className="card-tilt specimen-card relative aspect-[5/7] w-full">
        <div className="card-artwork technology-infusion" dangerouslySetInnerHTML={{ __html: cardArtwork(d) }} />
          <div className="holo pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}

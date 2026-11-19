import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, Linkedin, LoaderCircle, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { TECHNOLOGIES, toggleTechnology, type TechnologyId } from "@/lib/technology-signature";
import { SPECIMENS, serialFor, rarityFor } from "@/lib/specimens";
import { renderCard, downloadBlob } from "@/lib/render-card";
import { shareCard, copyCardImage, linkedinShareUrl, xShareUrl } from "@/lib/share-card";
import { CollectibleCard } from "@/components/CollectibleCard";
import { PortraitControls } from "@/components/PortraitControls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Impact — DevFest Sudbury 2026 Collectible" },
      { name: "description", content: "Discover the Sudbury Collection and create your own geological collectible card for DevFest Sudbury 2026." },
      { property: "og:title", content: "The Impact — The Sudbury Collection" },
      { property: "og:description", content: "1.85 billion years ago an impact shaped Sudbury. Make yours. Discover. Collect. Create." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [sid, setSid] = useState(SPECIMENS[0]?.id ?? "nickel");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [tech, setTech] = useState<TechnologyId[]>(["ml", "cloud"]);
  const [busy, setBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); setCanNativeShare("share" in navigator); }, []);
  const [portrait, setPortrait] = useState<string>();
  const [portraitBusy, setPortraitBusy] = useState(false);
  const specimen = SPECIMENS.find((s) => s.id === sid) ?? SPECIMENS[0];
  const [downloadError, setDownloadError] = useState("");
  if (!specimen) return null;
  const serial = serialFor(name || "collector", sid);
  const data = { name, title, tech, serial, rarity: rarityFor(serial), specimen, portrait };

  const toggle = (t: TechnologyId) => setTech((p) => toggleTechnology(p, t));
  const download = async () => {
    setBusy(true);
    setDownloadError("");
    try { downloadBlob(await renderCard(data), `the-impact-${specimen.id}-${serial}.png`); } catch { setDownloadError("Your card could not be downloaded. Please try again."); } finally { setBusy(false); }
  };
  const share = async () => {
    setShareBusy(true);
    try {
      const blob = await renderCard(data);
      const result = await shareCard(blob, data);
      if (result === "copied") toast.success("Card image copied! Ready to paste into your LinkedIn or X post");
      else if (result === "unsupported") { downloadBlob(blob, `the-impact-${specimen.id}-${serial}.png`); toast("Sharing isn't supported in this browser — your card was downloaded instead."); }
      setShareOpen(false);
    } catch { toast.error("Your card could not be shared. Please try again."); } finally { setShareBusy(false); }
  };
  const copyImage = async () => {
    setShareBusy(true);
    try {
      if (await copyCardImage(await renderCard(data))) { toast.success("Card image copied! Ready to paste into your LinkedIn or X post"); setShareOpen(false); }
      else toast.error("Copying images isn't supported in this browser. Try Download instead.");
    } catch { toast.error("Your card could not be copied. Please try again."); } finally { setShareBusy(false); }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Arrival */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 text-center">
        <div className="crater pointer-events-none absolute inset-0" aria-hidden>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ animationDelay: `${i * 1.2}s` }} />)}
        </div>
        <div className="meteor" aria-hidden />
        <p className="relative font-mono text-xs tracking-[0.4em] text-primary">DEVFEST SUDBURY 2026 · FIELD LOG 001</p>
        <h1 className="relative mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-tight sm:text-8xl md:text-9xl">THE<br /><span className="text-glow">IMPACT</span></h1>
        <p className="relative mt-6 font-mono text-sm tracking-[0.3em] text-muted-foreground">THE SUDBURY COLLECTION</p>
        <p className="relative mt-8 max-w-xl text-lg text-muted-foreground">
          1.85 billion years ago, something hit Northern Ontario hard enough to reshape it. Today, the builders here are making a different kind of impact.
        </p>
        <a href="#create" className="relative mt-10 rounded-full bg-primary px-8 py-4 font-mono text-sm font-semibold tracking-widest text-primary-foreground shadow-glow transition hover:scale-105">BEGIN EXCAVATION ↓</a>
      </section>

      {/* Story strip */}
      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-px sm:grid-cols-3">
          {[["01 · DISCOVER", "Browse six specimens inspired by the Sudbury Basin, each tuned to a corner of tech."],
            ["02 · COLLECT", "Claim the one that resonates. Every collector gets a unique field number."],
            ["03 · CREATE", "Etch your name and tools into it, then download and share your card."]].map(([h, p]) => (
            <div key={h} className="p-8"><div className="font-mono text-xs tracking-widest text-primary">{h}</div><p className="mt-3 text-muted-foreground">{p}</p></div>
          ))}
        </div>
      </section>

      {/* Creator */}
      <section id="create" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-24">
        <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground">LAYER 01 · SPECIMEN VAULT</div>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Choose your specimen</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">No hierarchy, no ranks — just six materials. Students, beginners and veterans welcome. (Fictional collection names inspired by real minerals.)</p>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {SPECIMENS.map((s, i) => {
            const on = s.id === sid;
            return (
              <Button variant="ghost" aria-label={s.name} aria-pressed={on} key={s.id} onClick={() => setSid(s.id)}
                className={`group relative block h-auto whitespace-normal overflow-hidden rounded-lg border p-0 text-left transition ${on ? "scale-[1.02]" : "opacity-70 hover:opacity-100"}`}
                style={{ borderColor: on ? s.accent : undefined, boxShadow: on ? `0 0 40px -10px ${s.accent}` : undefined }}>
                <img src={s.image} alt={s.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="font-mono text-[10px] tracking-widest" style={{ color: s.accent }}>0{i + 1} · {s.tags.toUpperCase()}</div>
                  <div className="font-display text-base font-bold uppercase sm:text-lg">{s.name}</div>
                  <div className="hidden text-xs text-muted-foreground sm:block">{s.blurb}</div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-20 grid items-start gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <div>
              <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground">COLLECTOR REGISTRATION</div>
              <h3 className="mt-2 font-display text-2xl font-bold sm:text-4xl">Etch your mark</h3>
            </div>
            <label className="block">
              <span className="font-mono text-xs tracking-widest text-muted-foreground">NAME</span>
              <input value={name} maxLength={22} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace"
                className="mt-2 w-full border-b bg-transparent py-3 font-display text-2xl outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="font-mono text-xs tracking-widest text-muted-foreground">ROLE / WHAT YOU BUILD</span>
              <input value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="Student · Cambrian College"
                className="mt-2 w-full border-b bg-transparent py-3 text-lg outline-none focus:border-primary" />
            </label>
            <fieldset>
              <legend className="font-mono text-xs tracking-widest text-muted-foreground">LAYER 02 · TECHNOLOGY SIGNATURE ({tech.length}/3)</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {TECHNOLOGIES.map((t) => {
                  const on = tech.includes(t.id);
                  return <Button variant="outline" size="sm" key={t.id} aria-pressed={on} disabled={!on && tech.length >= 3} onClick={() => toggle(t.id)} data-state={on ? "on" : "off"} className="signature-button rounded-full font-mono text-xs">{t.label}</Button>;
                })}
              </div>
              <div className="mt-4 min-h-12 border-l-2 border-primary pl-3 font-mono text-xs text-muted-foreground" aria-live="polite">
                {tech.length ? tech.map((id, index) => { const t = TECHNOLOGIES.find((item) => item.id === id); return <div key={id}>{index === 0 ? "PRIMARY" : "SECONDARY"} · {t?.effect}</div>; }) : "UNINFUSED · BASE SPECIMEN"}
              </div>
            </fieldset>
            <PortraitControls specimenId={sid} onChange={setPortrait} onBusy={setPortraitBusy} />
            <div className="rounded-2xl border bg-card/50 p-5 font-mono text-xs leading-relaxed text-muted-foreground">
              <span style={{ color: specimen.accent }}>FIELD NOTE ›</span> {specimen.role}. {specimen.blurb} Material: {specimen.material}. Assigned field no. <span className="text-foreground">{serial}</span> · classification <span className="text-foreground">{data.rarity}</span>.
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 lg:sticky lg:top-8">
            <CollectibleCard d={data} />
            <div className="flex w-full max-w-[380px] gap-3">
              <Button onClick={download} disabled={busy || shareBusy || portraitBusy} className="h-14 flex-1 rounded-full font-mono text-sm font-semibold tracking-widest">
                {busy ? <LoaderCircle className="animate-spin" /> : <Download />} {busy ? "POLISHING…" : "DOWNLOAD"}
              </Button>
              <Button variant="outline" onClick={() => setShareOpen(true)} disabled={busy || shareBusy || portraitBusy} className="h-14 flex-1 rounded-full border-primary font-mono text-sm font-semibold tracking-widest text-primary shadow-glow">
                <Share2 /> SHARE
              </Button>
            </div>
            {downloadError && <p role="alert" className="text-sm text-destructive">{downloadError}</p>}
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">SHARE WITH #DEVFESTSUDBURY</p>

            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-display">Share your collectible</DialogTitle>
                  <DialogDescription>Pick where your card goes — the caption and hashtags come pre-filled.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 pt-2">
                  {canNativeShare && (
                    <Button variant="outline" onClick={share} disabled={shareBusy} className="h-12 justify-start gap-3 font-mono text-xs tracking-widest">
                      {shareBusy ? <LoaderCircle className="animate-spin" /> : <Share2 />} SHARE VIA YOUR DEVICE
                    </Button>
                  )}
                  <Button variant="outline" onClick={copyImage} disabled={shareBusy} className="h-12 justify-start gap-3 font-mono text-xs tracking-widest">
                    {shareBusy ? <LoaderCircle className="animate-spin" /> : <Copy />} COPY IMAGE TO CLIPBOARD
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start gap-3 font-mono text-xs tracking-widest">
                    <a href={origin ? linkedinShareUrl(origin) : undefined} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}><Linkedin /> SHARE ON LINKEDIN</a>
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start gap-3 font-mono text-xs tracking-widest">
                    <a href={xShareUrl(data)} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}><Twitter /> POST ON X</a>
                  </Button>
                </div>
                <p className="pt-1 text-center font-mono text-[10px] tracking-widest text-muted-foreground">#DEVFESTSUDBURY · #DEVFESTSUDBURY2026 · #GDGSUDBURY</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-10 text-center font-mono text-xs tracking-widest text-muted-foreground">
        DISCOVER · COLLECT · CREATE — DEVFEST SUDBURY 2026 · 46.49°N 80.99°W
      </footer>
    </main>
  );
}

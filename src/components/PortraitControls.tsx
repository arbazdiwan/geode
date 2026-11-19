import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Trash2, RotateCcw, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createPortrait, DEFAULT_PORTRAIT, validatePhoto, type PortraitSettings } from "@/lib/portrait-artwork";
import { cutoutPortrait } from "@/lib/portrait-segmentation";

export function PortraitControls({ specimenId, onChange, onBusy }: {
  specimenId: string;
  onChange: (image: string | undefined) => void;
  onBusy: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null), captureInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null), stream = useRef<MediaStream | null>(null);
  const cameraRequest = useRef(0), uploadRequest = useRef(0);
  const [source, setSource] = useState<string>();
  const [cutout, setCutout] = useState<string>();
  const [settings, setSettings] = useState<PortraitSettings>(DEFAULT_PORTRAIT);
  const [mode, setMode] = useState(true), [error, setError] = useState("");
  const [processing, setProcessing] = useState(false), [loading, setLoading] = useState(false);
  const [camera, setCamera] = useState(false), [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let active = true;
    setCutout(undefined); onChange(undefined);
    if (!source) { onBusy(false); setLoading(false); return; }
    setLoading(true); onBusy(true); setError("");
    cutoutPortrait(source).then((image) => { if (active) setCutout(image); }).catch((e) => {
      if (active) setError(e instanceof Error ? e.message : "Photo cutout failed. Please try another portrait.");
    }).finally(() => { if (active) { setLoading(false); onBusy(false); } });
    return () => { active = false; };
  }, [source, onBusy, onChange]);

  useEffect(() => {
    let active = true;
    if (!cutout || !mode) { onChange(undefined); setProcessing(false); if (cutout || !source) onBusy(false); return; }
    onBusy(true); setProcessing(true);
    const timer = setTimeout(() => {
      createPortrait(cutout, specimenId, settings).then((image) => {
        if (active) { onChange(image); setError(""); }
      }).catch(() => {
        if (active) { onChange(undefined); setError("This photo could not be styled. Please try another photo."); }
      }).finally(() => { if (active) { setProcessing(false); onBusy(false); } });
    }, 80);
    return () => { active = false; clearTimeout(timer); };
  }, [cutout, source, mode, specimenId, settings, onChange, onBusy]);

  useEffect(() => () => { cameraRequest.current++; stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  const closeCamera = () => {
    cameraRequest.current++; stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null; setCameraReady(false); setCamera(false);
  };
  const openCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) { captureInput.current?.click(); return; }
    const request = ++cameraRequest.current;
    setCamera(true); setCameraReady(false);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1600 }, height: { ideal: 1600 } }, audio: false });
      if (request !== cameraRequest.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
    } catch {
      if (request === cameraRequest.current) { closeCamera(); setError("Camera access is unavailable. Allow camera access or upload a photo instead."); }
    }
  };
  const takePhoto = () => {
    const el = video.current;
    if (!el || !el.videoWidth) return;
    const canvas = document.createElement("canvas"); canvas.width = el.videoWidth; canvas.height = el.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(el, 0, 0); setSource(canvas.toDataURL("image/jpeg", .95));
    setSettings(DEFAULT_PORTRAIT); setMode(true); closeCamera();
  };
  const upload = async (file?: File) => {
    if (!file) return;
    const request = ++uploadRequest.current;
    setError(""); setLoading(true); onBusy(true);
    let url: string | undefined;
    try {
      validatePhoto(file); url = URL.createObjectURL(file);
      const image = new Image(); image.src = url; await image.decode();
      // Normalize orientation and bound memory before storing the local photo.
      const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Photo processing unavailable.");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (request === uploadRequest.current) { setSource(canvas.toDataURL("image/png")); setSettings(DEFAULT_PORTRAIT); setMode(true); }
    } catch (e) { if (request === uploadRequest.current) setError(e instanceof Error ? e.message : "This photo could not be opened."); }
    finally { if (url) URL.revokeObjectURL(url); if (request === uploadRequest.current) { setLoading(false); onBusy(false); } }
  };
  const remove = () => { uploadRequest.current++; setSource(undefined); setSettings(DEFAULT_PORTRAIT); setError(""); onChange(undefined); };
  const sliders: { key: keyof PortraitSettings; label: string; min: number; max: number; step: number }[] = [
    { key: "zoom", label: "Zoom", min: 1, max: 2.5, step: .05 },
    { key: "x", label: "Horizontal position", min: -100, max: 100, step: 1 },
    { key: "y", label: "Vertical position", min: -100, max: 100, step: 1 },
    { key: "strength", label: "Metallic finish", min: 0, max: 1, step: .05 },
  ];
  return <fieldset className="space-y-4 border-t pt-6">
    <legend className="font-mono text-xs text-muted-foreground">ATTENDEE PORTRAIT · OPTIONAL</legend>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload attendee photo" className="hidden" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
    <input ref={captureInput} type="file" accept="image/*" capture="user" aria-label="Capture attendee photo" className="hidden" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => input.current?.click()} disabled={loading}><Upload />{source ? "Replace photo" : "Upload photo"}</Button>
      <Button variant="outline" onClick={() => void openCamera()} disabled={loading}><Camera />Take a picture</Button>
      {source && <Button variant="ghost" size="icon" aria-label="Remove photo" title="Remove photo" onClick={remove}><Trash2 /></Button>}
    </div>
    <p className="text-xs text-muted-foreground">Your photo stays on this device and is never uploaded.</p>
    {source && <>
      <div className="flex gap-2" role="group" aria-label="Card artwork mode">
        <Button variant={mode ? "default" : "outline"} aria-pressed={mode} size="sm" onClick={() => setMode(true)}>Portrait</Button>
        <Button variant={!mode ? "default" : "outline"} aria-pressed={!mode} size="sm" onClick={() => setMode(false)}>Specimen only</Button>
        <Button variant="ghost" size="icon" title="Reset photo adjustments" aria-label="Reset photo adjustments" onClick={() => setSettings(DEFAULT_PORTRAIT)}><RotateCcw /></Button>
      </div>
      {mode && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {sliders.map(({ key, label, min, max, step }) => <div key={key} className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{key === "zoom" ? `${settings[key].toFixed(2)}×` : key === "strength" ? `${Math.round(settings[key] * 100)}%` : settings[key]}</span></div>
          <Slider aria-label={label} min={min} max={max} step={step} value={[settings[key]]} onValueChange={([value]) => { if (value !== undefined) setSettings((s) => ({ ...s, [key]: value })); }} />
        </div>)}
      </div>}
    </>}
    {(processing || loading) && <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3 animate-spin" />{loading ? "Cutting out portrait…" : "Polishing portrait…"}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Dialog open={camera} onOpenChange={(open) => { if (!open) closeCamera(); }}>
      <DialogContent>
        <DialogTitle>Take your portrait</DialogTitle>
        <DialogDescription>Camera preview</DialogDescription>
        <video ref={video} muted playsInline autoPlay onLoadedData={() => setCameraReady(true)} className="aspect-[4/3] w-full rounded-lg bg-card object-cover" />
        <Button onClick={takePhoto} disabled={!cameraReady}><Camera />Capture photo</Button>
      </DialogContent>
    </Dialog>
  </fieldset>;
}
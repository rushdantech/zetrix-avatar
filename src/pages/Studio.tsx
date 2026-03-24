import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Sparkles, RefreshCw, Download, Plus, Loader2,
  Image as ImageIcon, Video, Type, MapPin, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const PROVIDER_LABEL = "Kling AI";

const THEMES = ["Tech Review", "Travel Moment", "AI Insight", "Morning Routine", "Behind the Scenes", "Product Showcase", "City Exploration", "Creative Process"];
const MOODS = ["Energetic", "Calm", "Mysterious", "Playful", "Professional", "Cinematic"];

const IMAGE_FORMATS = ["JPG", "PNG", "WebP"] as const;
const VIDEO_FORMATS = ["MP4", "WebM"] as const;

export default function Studio() {
  const { assets, generateAsset, addToQueue, addNotification } = useApp();
  const [prompt, setPrompt] = useState("");
  const [formatType, setFormatType] = useState<"image" | "video">("image");
  const [theme, setTheme] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>("JPG");

  const selected = assets.find(a => a.id === selectedAsset);
  const downloadFormats = selected?.type === "video" ? VIDEO_FORMATS : IMAGE_FORMATS;
  const effectiveDownloadFormat = downloadFormats.includes(downloadFormat as (typeof downloadFormats)[number])
    ? downloadFormat
    : downloadFormats[0];

  useEffect(() => {
    if (selected) setDownloadFormat(selected.type === "video" ? "MP4" : "JPG");
  }, [selected?.id, selected?.type]);

  const handleGenerate = () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.error("Enter a prompt for content creation.");
      return;
    }
    generateAsset(trimmed, formatType, {
      theme: theme || undefined,
      mood: mood || undefined,
      location: location.trim() || undefined,
    });
    addNotification(`Generating ${formatType}: ${trimmed.slice(0, 40)}…`, "info");
    toast.info("Generating content...");
  };

  const handleDownload = (asset: typeof selected, format: string) => {
    if (!asset) return;
    toast.success(`Downloaded as ${format} — demo mode.`);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Studio</h1>
          <p className="text-sm text-muted-foreground">Generate and manage AI content with Kling AI.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px]">
        {/* Left: Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" /> Create content
            </h3>

            {/* 1. Prompt (required) */}
            <div>
              <label className="text-xs text-muted-foreground">Prompt for content creation <span className="text-destructive">*</span></label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe what you want to create…"
                rows={3}
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* 2. Format */}
            <div>
              <label className="text-xs text-muted-foreground">Format</label>
              <div className="mt-1 flex gap-2">
                {(["image", "video"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormatType(f)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-all capitalize",
                      formatType === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {f === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Optional: Theme */}
            <div>
              <label className="text-xs text-muted-foreground">Theme <span className="text-muted-foreground/70">(optional)</span></label>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {THEMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 4. Optional: Mood */}
            <div>
              <label className="text-xs text-muted-foreground">Mood <span className="text-muted-foreground/70">(optional)</span></label>
              <select
                value={mood}
                onChange={e => setMood(e.target.value)}
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {MOODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 5. Location */}
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Tokyo, Studio, Beach"
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* 6. Provider — Kling AI only */}
            <div>
              <label className="text-xs text-muted-foreground">Generative provider</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{PROVIDER_LABEL}</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90",
                !prompt.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Sparkles className="h-4 w-4" /> Generate
            </button>
          </div>
        </div>

        {/* Center: Gallery */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Gallery ({assets.length})</h3>
          </div>
          {assets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No assets yet. Enter a prompt and generate your first piece of content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  className={cn(
                    "rounded-xl border bg-secondary transition-all overflow-hidden text-left",
                    selectedAsset === asset.id ? "border-primary shadow-glow" : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="aspect-square flex items-center justify-center relative">
                    {asset.status === "generating" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Generating...</span>
                      </div>
                    ) : (
                      <>
                        {asset.type === "video" ? (
                          <Video className="h-10 w-10 text-muted-foreground" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            asset.status === "queued" ? "bg-info/10 text-info" :
                            asset.status === "generating" ? "bg-secondary text-muted-foreground" :
                            "bg-success/10 text-success"
                          )}
                        >
                          {asset.status === "approved" ? "ready" : asset.status}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{asset.theme}</p>
                    <p className="text-[10px] text-muted-foreground truncate" title={asset.prompt || asset.caption}>
                      {asset.prompt || asset.caption}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{asset.provider}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          {selected ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{selected.theme}</h3>
              <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                {selected.type === "video" ? (
                  <Video className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Type className="h-3 w-3" /> Caption / Prompt
                </label>
                <textarea
                  defaultValue={selected.caption}
                  rows={3}
                  className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {selected.hashtags.map(h => (
                  <span key={h} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {h}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.location && <p>Location: {selected.location}</p>}
                <p>Mood: {selected.mood}</p>
                <p>Provider: {selected.provider}</p>
                <p>Created: {format(parseISO(selected.createdAt), "MMM d, h:mm a")}</p>
              </div>
              <div className="space-y-2">
                {(selected.status === "ready" || selected.status === "approved") && (
                  <button
                    onClick={() => { addToQueue(selected.id, new Date().toISOString()); toast.success("Added to queue!"); }}
                    className="w-full flex items-center justify-center gap-1 rounded-lg bg-secondary py-2 text-xs font-medium hover:bg-secondary/80"
                  >
                    <Plus className="h-3 w-3" /> Add to Queue
                  </button>
                )}
                <div className={cn("space-y-2", selected.status === "generating" && "opacity-60 pointer-events-none")}>
                  <label className="text-xs text-muted-foreground block">Download format</label>
                  <select
                    value={effectiveDownloadFormat}
                    onChange={e => setDownloadFormat(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {downloadFormats.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDownload(selected, effectiveDownloadFormat)}
                    disabled={selected.status === "generating"}
                    className="w-full flex items-center justify-center gap-1 rounded-lg gradient-primary py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" /> Download as {effectiveDownloadFormat}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.info("Regenerating... (mock)")}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-secondary py-2 text-xs font-medium hover:bg-secondary/80"
                  >
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Select an asset to view details and download.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

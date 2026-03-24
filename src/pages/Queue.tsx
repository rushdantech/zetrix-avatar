import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { format, parseISO } from "date-fns";
import { Clock, Play, X, AlertTriangle, Check, Image as ImageIcon, Video, Edit2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Queue() {
  const { queue, history, postNow, cancelQueueItem, addNotification } = useApp();
  const [tab, setTab] = useState<"queue" | "history">("queue");
  const [postingMethod, setPostingMethod] = useState<"graph" | "unofficial">("graph");

  const handlePostNow = (id: string) => {
    postNow(id);
    addNotification("Post dispatched!", "info");
    toast.info("Posting... Result will appear in history.");
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case "posted": return <Check className="h-4 w-4 text-success" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "queued": return <Clock className="h-4 w-4 text-info" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Queue & Posting</h1>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        {(["queue", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("pb-2 text-sm font-medium capitalize transition-all border-b-2",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t} ({t === "queue" ? queue.length : history.length})
          </button>
        ))}
      </div>

      {/* Table */}
      {tab === "queue" && (
        queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Queue is empty. Add content from the Studio.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground">Asset</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Scheduled</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Platform</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(item => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                          {item.type === "video" ? <Video className="h-4 w-4 text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{item.theme}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{item.caption}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{format(parseISO(item.scheduledTime), "MMM d, h:mm a")}</td>
                    <td className="p-3 text-xs">{item.platform}</td>
                    <td className="p-3">{statusIcon(item.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => handlePostNow(item.id)}
                          className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">
                          <Play className="h-3 w-3" /> Post Now
                        </button>
                        <button onClick={() => toast.info("Edit schedule (mock)")}
                          className="rounded-md bg-secondary p-1 hover:bg-secondary/80">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => { cancelQueueItem(item.id); toast.success("Removed from queue"); }}
                          className="rounded-md bg-secondary p-1 hover:bg-destructive/10 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "history" && (
        history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Check className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No posting history yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground">Asset</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Posted At</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                          {item.type === "video" ? <Video className="h-4 w-4 text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <p className="font-medium text-xs">{item.theme}</p>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{format(parseISO(item.scheduledTime), "MMM d, h:mm a")}</td>
                    <td className="p-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                        item.status === "posted" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-destructive">{item.errorReason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Posting Method Settings */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Posting Method</h3>
        </div>
        <div className="space-y-2">
          {[
            { value: "graph" as const, label: "Meta Graph API", desc: "Official API — recommended for reliability", badge: "Preferred" },
            { value: "unofficial" as const, label: "Unofficial Library", desc: "Fallback — may break with platform updates", badge: "Fallback" },
          ].map(m => (
            <label key={m.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all",
              postingMethod === m.value ? "bg-primary/5 border border-primary/20" : "bg-secondary border border-transparent")}>
              <input type="radio" name="posting" checked={postingMethod === m.value}
                onChange={() => setPostingMethod(m.value)} className="mt-1 accent-primary" style={{ accentColor: "hsl(352, 72%, 42%)" }} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    m.value === "graph" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{m.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                {m.value === "unofficial" && postingMethod === "unofficial" && (
                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> This method may violate Instagram ToS. Use at your own risk.
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

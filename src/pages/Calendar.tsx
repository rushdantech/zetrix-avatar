import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video, X, Clock, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "month" | "week";
type StatusFilter = "all" | "planned" | "generated" | "scheduled" | "posted" | "failed";

export default function Calendar() {
  const { calendarEntries, generateContentPlan, addNotification } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");

  const filteredEntries = calendarEntries.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = useMemo(() => {
    const ws = startOfWeek(currentDate);
    const we = endOfWeek(currentDate);
    return eachDayOfInterval({ start: ws, end: we });
  }, [currentDate]);

  const displayDays = viewMode === "month" ? days : weekDays;

  const entry = calendarEntries.find(e => e.id === selectedEntry);

  const statusColor = (s: string) => {
    switch (s) {
      case "posted": return "bg-success/10 text-success";
      case "scheduled": return "bg-info/10 text-info";
      case "generated": return "bg-primary/10 text-primary";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  if (calendarEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Content Plan Yet</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">Generate a content plan to populate your calendar with 14–30 days of planned content.</p>
        <button onClick={() => { generateContentPlan(); addNotification("Content plan generated!", "success"); toast.success("Content plan generated with 28 entries!"); }}
          className="rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          Generate Content Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-secondary p-0.5">
            {(["month", "week"] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all capitalize",
                  viewMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "planned", "generated", "scheduled", "posted", "failed"] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all capitalize",
              statusFilter === s ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {s}
          </button>
        ))}
        <span className="text-border">|</span>
        {(["all", "image", "video"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all capitalize",
              typeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {/* Calendar nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="rounded-lg bg-secondary p-2 hover:bg-secondary/80">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{format(currentDate, "MMMM yyyy")}</span>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="rounded-lg bg-secondary p-2 hover:bg-secondary/80">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {displayDays.map(day => {
            const dayEntries = filteredEntries.filter(e => isSameDay(parseISO(e.date), day));
            const inMonth = isSameMonth(day, currentDate);
            return (
              <div key={day.toISOString()}
                className={cn("min-h-[80px] border-b border-r border-border p-1", !inMonth && "opacity-30")}>
                <span className={cn("text-xs font-medium", isSameDay(day, new Date()) && "text-primary")}>
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEntries.slice(0, 3).map(e => (
                    <button key={e.id} onClick={() => setSelectedEntry(e.id)}
                      className={cn("w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium transition-all hover:opacity-80", statusColor(e.status))}>
                      {e.type === "video" ? "🎬" : "📸"} {e.theme}
                    </button>
                  ))}
                  {dayEntries.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEntries.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {entry && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm animate-slide-in-right border-l border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{entry.theme}</h3>
            <button onClick={() => setSelectedEntry(null)} className="rounded-md p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
              {entry.type === "video" ? <Video className="h-12 w-12 text-muted-foreground" /> : <ImageIcon className="h-12 w-12 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Caption</p>
              <textarea defaultValue={entry.caption} rows={3}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColor(entry.status))}>{entry.status}</span>
              <span className="text-xs text-muted-foreground">{entry.type}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
              <input type="datetime-local" defaultValue={entry.date.slice(0, 16)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.hashtags.map(h => (
                <span key={h} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{h}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { toast.info("Regenerating…"); setSelectedEntry(null); }}
                className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium hover:bg-secondary/80">
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
              <button onClick={() => { toast.success("Saved!"); setSelectedEntry(null); }}
                className="flex-1 rounded-lg gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

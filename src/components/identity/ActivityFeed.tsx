import type { ActivityEvent } from "@/types/identity";
import { formatSmartTimestamp } from "@/lib/identity/format";
import { StatusBadge } from "./StatusBadge";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{event.agentName} · {event.eventType}</p>
            <StatusBadge value={event.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
          <p className="mt-1 text-[11px] text-muted-foreground" title={event.timestamp}>{formatSmartTimestamp(event.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}

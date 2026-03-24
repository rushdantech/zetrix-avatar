import { Badge } from "@/components/ui/badge";
import type { JobCardData } from "@/features/job-agent/types";

interface JobCardProps {
  data: JobCardData;
  onApply: () => void;
  onDetails: () => void;
}

function scoreClass(score: number) {
  if (score >= 90) return "bg-success/10 text-success border-success/30";
  if (score >= 75) return "bg-warning/15 text-warning border-warning/40";
  return "bg-amber-200/15 text-amber-700 border-amber-300/40";
}

export function JobCard({ data, onApply, onDetails }: JobCardProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className={scoreClass(data.match_score)}>
          {data.match_score}%
        </Badge>
        <p className="text-xs text-muted-foreground">{data.location} · {data.salary}</p>
      </div>
      <div>
        <h4 className="font-semibold text-sm">{data.title}</h4>
        <p className="text-sm text-muted-foreground">{data.company}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {data.matched_skills.map((skill) => (
          <span key={skill} className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success">
            ✅ {skill}
          </span>
        ))}
        {(data.gaps ?? []).map((gap) => (
          <span key={gap} className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
            ⚠ {gap}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onApply} className="rounded-md gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Apply
        </button>
        <button onClick={onDetails} className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium">
          Details
        </button>
        {data.listing_url && (
          <a
            href={data.listing_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium"
          >
            View Listing
          </a>
        )}
      </div>
    </div>
  );
}

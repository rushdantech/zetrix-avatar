import { format, parseISO } from "date-fns";
import { Download, FileText } from "lucide-react";
import type { StudioEntityIndividual } from "@/types/studio";
import { mockAvatarInteractionReports } from "@/lib/studio/avatar-interaction-reports-mock";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function pdfHref(reportId: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const url = `${base}mock-avatar-interaction-report.pdf`;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}report=${encodeURIComponent(reportId)}`;
}

export function IndividualAvatarAnalyticsPanel({ entity }: { entity: StudioEntityIndividual }) {
  const rows = mockAvatarInteractionReports(entity.id);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm shadow-card">
      <div>
        <h3 className="text-lg font-bold text-foreground">Interaction reports</h3>
        <p className="mt-2 text-muted-foreground">
          Download PDF summaries of how subscribers and visitors interact with your avatar in Marketplace chat and related
          experiences. Reports are generated on a schedule you configure when this feature is connected to analytics
          services.
        </p>
      </div>

      <div className="hidden rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] whitespace-nowrap">Generated</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="hidden lg:table-cell">Summary</TableHead>
              <TableHead className="w-[140px] text-right">Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="align-top text-muted-foreground whitespace-nowrap">
                  {format(parseISO(r.generatedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="align-top font-medium text-foreground">{r.periodLabel}</TableCell>
                <TableCell className="hidden align-top text-muted-foreground lg:table-cell">{r.summary}</TableCell>
                <TableCell className="align-top text-right">
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={pdfHref(r.id)} download={`zetrix-avatar-interactions-${r.id}.pdf`}>
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      PDF
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Stacked cards on small screens */}
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-secondary/25 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{r.periodLabel}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(r.generatedAt), "MMM d, yyyy")}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{r.summary}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
                <a href={pdfHref(r.id)} download={`zetrix-avatar-interactions-${r.id}.pdf`}>
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  PDF
                </a>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Demo downloads use a placeholder PDF file. Production builds will link to generated reports per period.
      </p>
    </div>
  );
}

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Download, FileText } from "lucide-react";
import type { StudioEntityIndividual } from "@/types/studio";
import { mockAvatarInteractionReports } from "@/lib/studio/avatar-interaction-reports-mock";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
  const allRows = mockAvatarInteractionReports(entity.id);
  const reportDates = useMemo(
    () => new Set(allRows.map((r) => r.reportDate)),
    [allRows],
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() =>
    allRows.length ? parseISO(allRows[0].reportDate) : undefined,
  );
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
  const rows = useMemo(
    () => allRows.filter((r) => r.reportDate === selectedKey),
    [allRows, selectedKey],
  );

  function onCalendarSelect(day: Date | undefined) {
    if (day) {
      setSelectedDay(day);
      return;
    }
    if (allRows.length) setSelectedDay(parseISO(allRows[0].reportDate));
  }

  if (!allRows.length) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm shadow-card">
        <h3 className="text-lg font-bold text-foreground">Interaction reports</h3>
        <p className="text-muted-foreground">Daily reports will appear here once analytics is connected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm shadow-card">
      <div>
        <h3 className="text-lg font-bold text-foreground">Interaction reports</h3>
        <p className="mt-2 text-muted-foreground">
          PDFs are generated once per day. Choose a date on the calendar to view and download that day&apos;s report.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal sm:w-[260px]", !selectedDay && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              {selectedDay ? format(selectedDay, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={onCalendarSelect}
              modifiers={{
                hasReport: (date) => reportDates.has(format(date, "yyyy-MM-dd")),
              }}
              modifiersClassNames={{
                hasReport: "relative font-semibold after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {selectedDay && !rows.length ? (
          <p className="text-sm text-muted-foreground">No report for this date. Days with a daily PDF are marked in the calendar.</p>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <>
          <div className="hidden rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px] whitespace-nowrap">Generated</TableHead>
                  <TableHead>Day</TableHead>
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
        </>
      ) : null}

      {selectedDay && !rows.length ? null : (
        <p className="text-xs text-muted-foreground">
          Demo downloads use a placeholder PDF file. Production builds will link to generated daily reports.
        </p>
      )}
    </div>
  );
}

/**
 * Mock interaction analytics reports for Avatar Profile → Analytics.
 * Replace with API rows when backend serves PDF URLs per avatar.
 */

export type AvatarInteractionReportRow = {
  id: string;
  /** ISO timestamp when the report was generated */
  generatedAt: string;
  /** e.g. "Weekly · Mar 3–9, 2026" */
  periodLabel: string;
  /** One-line summary for the row */
  summary: string;
};

/** Demo rows; ordering newest first */
export function mockAvatarInteractionReports(_avatarId: string): AvatarInteractionReportRow[] {
  void _avatarId;
  return [
    {
      id: "rep_w14",
      generatedAt: "2026-04-14T09:00:00.000Z",
      periodLabel: "Weekly · Apr 8–14, 2026",
      summary: "Chats, follows, and Marketplace touches summarized for subscribers.",
    },
    {
      id: "rep_w13",
      generatedAt: "2026-04-07T09:00:00.000Z",
      periodLabel: "Weekly · Apr 1–7, 2026",
      summary: "Subscriber engagement and conversation themes.",
    },
    {
      id: "rep_m03",
      generatedAt: "2026-04-01T08:15:00.000Z",
      periodLabel: "Monthly · March 2026",
      summary: "Full-month rollup: sessions, unique visitors, top intents.",
    },
    {
      id: "rep_w12",
      generatedAt: "2026-03-31T09:00:00.000Z",
      periodLabel: "Weekly · Mar 25–31, 2026",
      summary: "Mid-period snapshot before monthly close.",
    },
  ];
}

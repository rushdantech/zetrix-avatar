/**
 * Mock interaction analytics reports for Avatar Profile → Analytics.
 * Replace with API rows when backend serves PDF URLs per avatar.
 */

export type AvatarInteractionReportRow = {
  id: string;
  /** Calendar day this report covers (YYYY-MM-DD) */
  reportDate: string;
  /** ISO timestamp when the report was generated */
  generatedAt: string;
  /** e.g. "Daily · Apr 14, 2026" */
  periodLabel: string;
  /** One-line summary for the row */
  summary: string;
};

/** Demo rows — one PDF per calendar day; ordering newest first */
export function mockAvatarInteractionReports(_avatarId: string): AvatarInteractionReportRow[] {
  void _avatarId;
  return [
    {
      id: "rep_2026_04_14",
      reportDate: "2026-04-14",
      generatedAt: "2026-04-15T06:00:00.000Z",
      periodLabel: "Daily · Apr 14, 2026",
      summary: "Chats, follows, and Marketplace touches summarized for subscribers.",
    },
    {
      id: "rep_2026_04_13",
      reportDate: "2026-04-13",
      generatedAt: "2026-04-14T06:00:00.000Z",
      periodLabel: "Daily · Apr 13, 2026",
      summary: "Subscriber engagement and conversation themes.",
    },
    {
      id: "rep_2026_04_12",
      reportDate: "2026-04-12",
      generatedAt: "2026-04-13T06:00:00.000Z",
      periodLabel: "Daily · Apr 12, 2026",
      summary: "Peak hours, top intents, and drop-off points in chat.",
    },
    {
      id: "rep_2026_04_11",
      reportDate: "2026-04-11",
      generatedAt: "2026-04-12T06:00:00.000Z",
      periodLabel: "Daily · Apr 11, 2026",
      summary: "Visitor vs subscriber mix and Marketplace listing views.",
    },
    {
      id: "rep_2026_04_10",
      reportDate: "2026-04-10",
      generatedAt: "2026-04-11T06:00:00.000Z",
      periodLabel: "Daily · Apr 10, 2026",
      summary: "Conversation volume and sentiment snapshot.",
    },
  ];
}

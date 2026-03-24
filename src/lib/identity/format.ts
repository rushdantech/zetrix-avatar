import { formatDistanceToNowStrict, format } from "date-fns";

export function truncateDid(value: string, left = 12, right = 8) {
  if (value.length <= left + right + 3) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
}

export function formatScopeLabel(scope: string) {
  const normalized = scope.replace(/^zid:action:/, "");
  const words = normalized.split("-").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatSmartTimestamp(iso: string) {
  const date = new Date(iso);
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return `${formatDistanceToNowStrict(date)} ago`;
  return format(date, "MMM d, yyyy");
}

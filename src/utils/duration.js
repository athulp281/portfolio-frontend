/**
 * Date helpers for the Experience section. A job's duration is computed from
 * its joining date (`start`) to `end` (or now when `end` is empty = current).
 */

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Whole months between start and (end || now). Never negative. */
export function monthsBetween(start, end) {
  const s = toDate(start);
  if (!s) return 0;
  const e = toDate(end) || new Date();
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() < s.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Format a month count as "3 yr 6 mo" (with "< 1 mo" floor). */
export function formatMonths(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  if (!parts.length) parts.push("< 1 mo");
  return parts.join(" ");
}

/** Convenience: duration string from start → end|now. */
export function formatDuration(start, end) {
  return formatMonths(monthsBetween(start, end));
}

/** "Jun 2021 — Present" / "Jun 2021 — Mar 2024". */
export function formatPeriod(start, end) {
  const s = toDate(start);
  const opts = { month: "short", year: "numeric" };
  const from = s ? s.toLocaleDateString("en-US", opts) : "";
  const e = toDate(end);
  const to = end ? (e ? e.toLocaleDateString("en-US", opts) : end) : "Present";
  return from ? `${from} — ${to}` : to;
}

export function isCurrent(end) {
  return !end;
}

import type { RecurrenceInterval } from "@/lib/api/types";

export const recurrenceLabels: Record<RecurrenceInterval, string> = {
  hour: "Every hour",
  day: "Every day",
  week: "Every week",
  month: "Every month",
  year: "Every year",
};

export function nextReminderAt(interval: RecurrenceInterval, from = new Date()): string {
  const d = new Date(from);
  switch (interval) {
    case "hour":
      d.setHours(d.getHours() + 1);
      break;
    case "day":
      d.setDate(d.getDate() + 1);
      break;
    case "week":
      d.setDate(d.getDate() + 7);
      break;
    case "month":
      d.setMonth(d.getMonth() + 1);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString();
}

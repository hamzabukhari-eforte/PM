function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** `dd-MM-yyyy HH:mm:ss` (local), aligned with ticket “Reported” text field. */
export function formatTicketDateTimeLocal(d: Date) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function parseTicketDateTimeLocal(s: string): Date | undefined {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(s.trim());
  if (!m) return undefined;
  const d = new Date(
    Number(m[3]),
    Number(m[2]) - 1,
    Number(m[1]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
  );
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function ticketDateTimeLocalToIso(s: string): string | null {
  const d = parseTicketDateTimeLocal(s);
  return d ? d.toISOString() : null;
}

export function isoToTicketDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : formatTicketDateTimeLocal(d);
}

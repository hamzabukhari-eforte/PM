function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** `dd-MM-yyyy` (local), for date-only fields such as project timelines. */
export function formatTicketDateLocal(d: Date) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function parseTicketDateLocal(s: string | null | undefined): Date | undefined {
  if (!s?.trim()) return undefined;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 0, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** `dd-MM-yyyy HH:mm:ss` (local), aligned with ticket “Reported” text field. */
export function formatTicketDateTimeLocal(d: Date) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function parseTicketDateTimeLocal(s: string | null | undefined): Date | undefined {
  if (!s?.trim()) return undefined;
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

/** Form display: ISO datetime or `YYYY-MM-DD` → date-only picker format. */
export function isoOrDateToTicketDateLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const trimmed = iso.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const d = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
      0,
      0,
      0,
    );
    return Number.isNaN(d.getTime()) ? "" : formatTicketDateLocal(d);
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? "" : formatTicketDateLocal(d);
}

/** Project date fields stored as `YYYY-MM-DD`. */
export function ticketDateLocalToIsoDate(s: string | null | undefined): string | null {
  const d = parseTicketDateLocal(s);
  if (!d) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Form display: ISO datetime or `YYYY-MM-DD` → ticket picker format. */
export function isoOrDateToTicketDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const trimmed = iso.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const d = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
      0,
      0,
      0,
    );
    return Number.isNaN(d.getTime()) ? "" : formatTicketDateTimeLocal(d);
  }
  return isoToTicketDateTimeLocal(trimmed);
}

/** Project date fields stored as `YYYY-MM-DD`. */
export function ticketDateTimeLocalToIsoDate(s: string | null | undefined): string | null {
  const d = parseTicketDateTimeLocal(s);
  if (!d) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Normalize plan/task timeline values for the ticket picker. */
export function toTicketDateTimePickerValue(iso: string | null | undefined): string {
  if (!iso) return "";
  if (parseTicketDateTimeLocal(iso)) return iso;
  return isoOrDateToTicketDateTimeLocal(iso);
}

/** Normalize picker value to ISO for API storage. */
export function fromTicketDateTimePickerValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return ticketDateTimeLocalToIso(trimmed) ?? trimmed;
}

/** Zero-padded stopwatch: `04 sec` → `01 min 04 sec` → `01 hour 01 min 04 sec` */
export function formatStopwatch(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)} hour ${pad(minutes)} min ${pad(seconds)} sec`;
  }
  if (minutes > 0) {
    return `${pad(minutes)} min ${pad(seconds)} sec`;
  }
  return `${pad(seconds)} sec`;
}

/** Compact stopwatch for kanban cards. */
export function formatStopwatchCompact(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
  return `00:${pad(seconds)}`;
}

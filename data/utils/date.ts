/**
 * Canonical ISO-8601 UTC timestamp utilities.
 */

export function nowIso(): string {
  return new Date().toISOString();
}

export function toIso(date: Date | number | string): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return new Date(date).toISOString();
}

/**
 * Calculates and formats workout duration between startedAt and completedAt.
 * Examples: '8 min', '48 min', '1 hr 08 min'
 */
export function formatWorkoutDuration(
  startedAt: string,
  completedAt?: string | null
): string {
  const startMs = new Date(startedAt).getTime();
  const endMs = completedAt ? new Date(completedAt).getTime() : Date.now();

  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
    return '0 min';
  }

  const totalSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);

  if (totalMinutes < 1) {
    return '< 1 min';
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return `${hours} hr ${pad(minutes)} min`;
}

/**
 * Formats an ISO date string for summary display (e.g., 'Sep 10, 2026 • 5:30 PM').
 */
export function formatSummaryDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return '';
  }

  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} • ${timeStr}`;
}

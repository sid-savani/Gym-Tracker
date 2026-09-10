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

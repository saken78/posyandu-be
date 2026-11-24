export function angka(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

// DATE -> YYYY-MM-DD
export function toDateOnly(value: Date | string | null): string | null {
  if (value === null) return null;

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

// DATETIME -> ISO 8601
export function toISOString(value: Date | string | null): string | null {
  if (value === null) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

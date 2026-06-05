/** 当日 0 点（UTC），用于日维度聚合的稳定分桶。 */
export function startOfUtcDay(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** n 天前的当日 0 点（UTC）。 */
export function utcDaysAgo(n: number): Date {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** yyyy-mm-dd（UTC），用于分桶键。 */
export function utcDateKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

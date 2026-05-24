export function errorsPerHour(lines: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const line of lines) {
    const parts = line.split(" ", 3);
    if (parts.length < 2) continue;
    const [timestamp, level] = parts;
    if (level !== "ERROR" || timestamp.length < 13 || timestamp[10] !== "T") continue;
    const hour = timestamp.slice(0, 13);
    counts[hour] = (counts[hour] ?? 0) + 1;
  }
  return counts;
}

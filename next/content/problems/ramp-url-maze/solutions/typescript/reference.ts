type Page = {
  kind: string;
  payload: unknown;
  failures: number;
};

export function findExitUrl(pages: unknown[][], start: string, maxRetries: number): string {
  const byUrl = new Map<string, Page>();
  for (const row of pages) {
    const [url, kind, payload, failures] = row;
    byUrl.set(String(url), {
      kind: String(kind),
      payload,
      failures: Number(failures)
    });
  }

  const queue: string[] = [start];
  const visited = new Set<string>();
  const attempts = new Map<string, number>();

  while (queue.length > 0) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;

    const page = byUrl.get(url);
    if (!page) continue;

    const attempt = attempts.get(url) ?? 0;
    if (attempt < page.failures) {
      const nextAttempt = attempt + 1;
      attempts.set(url, nextAttempt);
      if (nextAttempt <= maxRetries) queue.push(url);
      continue;
    }

    visited.add(url);
    if (page.kind === "EXIT") return url;
    if (page.kind !== "LINKS" || !Array.isArray(page.payload)) continue;

    for (const nextUrl of page.payload) {
      const child = String(nextUrl);
      if (!visited.has(child)) queue.push(child);
    }
  }

  return "";
}

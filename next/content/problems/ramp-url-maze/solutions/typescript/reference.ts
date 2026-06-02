declare function fetchUrl(url: string): unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readWithRetries(url: string, maxRetries: number): unknown {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = fetchUrl(url);
    if (isRecord(response) && response.status === 503) {
      if (attempt === maxRetries) return null;
      continue;
    }
    return response;
  }
  return null;
}

export function findFinalUrl(startUrl: string, maxRetries: number): string | null {
  const queue: string[] = [startUrl];
  const seen = new Set<string>([startUrl]);

  for (let head = 0; head < queue.length; head += 1) {
    const url = queue[head];
    const response = readWithRetries(url, maxRetries);

    if (response === "congrats") return url;
    if (!isRecord(response) || !Array.isArray(response.urls)) continue;

    for (const nextUrl of response.urls) {
      if (typeof nextUrl !== "string" || seen.has(nextUrl)) continue;
      seen.add(nextUrl);
      queue.push(nextUrl);
    }
  }

  return null;
}

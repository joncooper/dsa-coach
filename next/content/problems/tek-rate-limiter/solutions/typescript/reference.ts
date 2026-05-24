export function rateLimited(events: Array<[number, string]>, limit: number, window: number): boolean[] {
  const accepted = new Map<string, number[]>();
  const out: boolean[] = [];
  for (const [timestamp, userId] of events) {
    const queue = accepted.get(userId) ?? [];
    while (queue.length > 0 && queue[0] <= timestamp - window) queue.shift();
    if (queue.length < limit) { queue.push(timestamp); out.push(true); }
    else out.push(false);
    accepted.set(userId, queue);
  }
  return out;
}

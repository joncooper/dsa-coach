export function sessionizeEvents(events: Array<[number, string]>, timeout: number): Array<[string, number, number, number]> {
  const open = new Map<string, { start: number; end: number; count: number }>();
  const closed: Array<[string, number, number, number]> = [];
  for (const [timestamp, userId] of events) {
    const session = open.get(userId);
    if (!session || timestamp - session.end > timeout) {
      if (session) closed.push([userId, session.start, session.end, session.count]);
      open.set(userId, { start: timestamp, end: timestamp, count: 1 });
    } else {
      session.end = timestamp;
      session.count += 1;
    }
  }
  for (const [userId, session] of open) closed.push([userId, session.start, session.end, session.count]);
  closed.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  return closed;
}

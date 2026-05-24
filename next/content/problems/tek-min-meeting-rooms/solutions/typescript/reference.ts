export function minMeetingRooms(meetings: number[][]): number {
  const events: Array<[number, number]> = [];
  for (const [start, end] of meetings) { events.push([start, 1], [end, -1]); }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let active = 0;
  let peak = 0;
  for (const [, delta] of events) { active += delta; peak = Math.max(peak, active); }
  return peak;
}

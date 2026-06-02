type Flight = {
  depart: string;
  arrive: string;
  origin: string;
  destination: string;
};

export function userLocations(flights: string[][], queryTime: string): string[][] {
  const byUser = new Map<string, Flight[]>();
  for (const [userId, origin, depart, destination, arrive] of flights) {
    const timeline = byUser.get(userId) ?? [];
    timeline.push({ depart, arrive, origin, destination });
    byUser.set(userId, timeline);
  }

  const out: string[][] = [];
  for (const userId of [...byUser.keys()].sort()) {
    const timeline = byUser.get(userId)!.sort((a, b) => a.depart.localeCompare(b.depart));
    let status = "UNKNOWN";

    for (const flight of timeline) {
      if (queryTime < flight.depart) break;
      if (flight.depart <= queryTime && queryTime < flight.arrive) {
        status = `IN_FLIGHT:${flight.origin}->${flight.destination}`;
      } else {
        status = flight.destination;
      }
    }

    out.push([userId, status]);
  }
  return out;
}

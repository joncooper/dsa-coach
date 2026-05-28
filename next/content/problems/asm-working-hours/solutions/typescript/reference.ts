type Session = { start: number; end: number; position: string; compensation: number };
type PendingPromotion = { position: string; compensation: number; start: number };

type Worker = {
  position: string;
  compensation: number;
  insideSince: number | null;
  activePosition: string;
  activeCompensation: number;
  totalTime: number;
  timeByPosition: Map<string, number>;
  sessions: Session[];
  pending: PendingPromotion | null;
};

export function solution(queries: string[][]): string[] {
  const workers = new Map<string, Worker>();
  const doublePay: Array<[number, number]> = [];
  const out: string[] = [];

  const coveredDoubleTime = (start: number, end: number): number => {
    const clipped: Array<[number, number]> = [];
    for (const [periodStart, periodEnd] of doublePay) {
      const left = Math.max(start, periodStart);
      const right = Math.min(end, periodEnd);
      if (left < right) clipped.push([left, right]);
    }
    if (!clipped.length) return 0;
    clipped.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let [currentStart, currentEnd] = clipped[0];
    let total = 0;
    for (const [left, right] of clipped.slice(1)) {
      if (left <= currentEnd) currentEnd = Math.max(currentEnd, right);
      else {
        total += currentEnd - currentStart;
        currentStart = left;
        currentEnd = right;
      }
    }
    return total + currentEnd - currentStart;
  };

  const addSession = (worker: Worker, start: number, end: number): void => {
    if (end <= start) return;
    const duration = end - start;
    worker.totalTime += duration;
    worker.timeByPosition.set(worker.activePosition, (worker.timeByPosition.get(worker.activePosition) ?? 0) + duration);
    worker.sessions.push({ start, end, position: worker.activePosition, compensation: worker.activeCompensation });
  };

  const applyPendingOnEntry = (worker: Worker, timestamp: number): void => {
    if (!worker.pending || timestamp < worker.pending.start) return;
    worker.position = worker.pending.position;
    worker.compensation = worker.pending.compensation;
    worker.pending = null;
  };

  const calcSalary = (worker: Worker, start: number, end: number): number => {
    let total = 0;
    for (const session of worker.sessions) {
      const left = Math.max(start, session.start);
      const right = Math.min(end, session.end);
      if (left >= right) continue;
      total += (right - left) * session.compensation;
      total += coveredDoubleTime(left, right) * session.compensation;
    }
    return total;
  };

  const topWorkers = (count: number, position: string): string => {
    if (count <= 0) return "";
    return [...workers]
      .filter(([, worker]) => worker.position === position)
      .map(([workerId, worker]) => [workerId, worker.timeByPosition.get(position) ?? 0] as [string, number])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, count)
      .map(([workerId, time]) => workerId + "(" + time + ")")
      .join(",");
  };

  for (const query of queries) {
    switch (query[0]) {
      case "ADD_WORKER": {
        const [workerId, position] = [query[1], query[2]];
        const compensation = Number(query[3]);
        if (workers.has(workerId)) out.push("false");
        else {
          workers.set(workerId, {
            position,
            compensation,
            insideSince: null,
            activePosition: position,
            activeCompensation: compensation,
            totalTime: 0,
            timeByPosition: new Map(),
            sessions: [],
            pending: null
          });
          out.push("true");
        }
        break;
      }
      case "REGISTER": {
        const worker = workers.get(query[1]);
        const timestamp = Number(query[2]);
        if (!worker) {
          out.push("invalid_request");
        } else if (worker.insideSince === null) {
          applyPendingOnEntry(worker, timestamp);
          worker.insideSince = timestamp;
          worker.activePosition = worker.position;
          worker.activeCompensation = worker.compensation;
          out.push("registered");
        } else {
          addSession(worker, worker.insideSince, timestamp);
          worker.insideSince = null;
          out.push("registered");
        }
        break;
      }
      case "GET": {
        const worker = workers.get(query[1]);
        out.push(worker ? String(worker.totalTime) : "");
        break;
      }
      case "TOP_N_WORKERS":
        out.push(topWorkers(Number(query[1]), query[2]));
        break;
      case "PROMOTE": {
        const worker = workers.get(query[1]);
        if (!worker || worker.pending) out.push("invalid_request");
        else {
          worker.pending = { position: query[2], compensation: Number(query[3]), start: Number(query[4]) };
          out.push("success");
        }
        break;
      }
      case "CALC_SALARY": {
        const worker = workers.get(query[1]);
        out.push(worker ? String(calcSalary(worker, Number(query[2]), Number(query[3]))) : "");
        break;
      }
      case "SET_DOUBLE_PAY": {
        const start = Number(query[1]);
        const end = Number(query[2]);
        if (start >= end) out.push("false");
        else {
          doublePay.push([start, end]);
          out.push("true");
        }
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

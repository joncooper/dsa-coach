type Day = {
  year: number;
  month: number;
  day: number;
  time: number;
};

const CADENCE_ORDER = ["DAILY", "WEEKLY", "MONTHLY"];

export function recurringTransactions(transactions: string[][]): string[][] {
  const groups = new Map<string, Day[]>();
  for (const [dateText, merchant, amount, currency] of transactions) {
    const key = `${merchant}\u0000${amount}\u0000${currency}`;
    const dates = groups.get(key) ?? [];
    dates.push(parseDate(dateText));
    groups.set(key, dates);
  }

  const out: string[][] = [];
  for (const [key, dates] of groups.entries()) {
    const uniqueDates = [...new Map(dates.map((day) => [day.time, day])).values()]
      .sort((a, b) => a.time - b.time);
    const cadence = bestCadence(uniqueDates);
    if (cadence) {
      const [merchant, amount, currency] = key.split("\u0000");
      out.push([merchant, amount, currency, cadence]);
    }
  }

  return out.sort(compareRows);
}

function bestCadence(dates: Day[]): string {
  const candidates: Array<[string, number]> = [
    ["DAILY", longestStreak(dates, (a, b) => b.time - a.time === 86_400_000)],
    ["WEEKLY", longestStreak(dates, (a, b) => b.time - a.time === 7 * 86_400_000)],
    ["MONTHLY", longestStreak(dates, isNextMonth)]
  ].filter(([, length]) => length >= 3);

  if (candidates.length === 0) return "";
  candidates.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return CADENCE_ORDER.indexOf(a[0]) - CADENCE_ORDER.indexOf(b[0]);
  });
  return candidates[0][0];
}

function longestStreak(dates: Day[], follows: (a: Day, b: Day) => boolean): number {
  if (dates.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    if (follows(dates[i - 1], dates[i])) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
  }
  return best;
}

function isNextMonth(prev: Day, curr: Day): boolean {
  const year = prev.month === 12 ? prev.year + 1 : prev.year;
  const month = prev.month === 12 ? 1 : prev.month + 1;
  if (curr.year !== year || curr.month !== month) return false;
  return curr.day === prev.day || (isMonthEnd(prev) && isMonthEnd(curr));
}

function isMonthEnd(day: Day): boolean {
  return day.day === daysInMonth(day.year, day.month);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseDate(value: string): Day {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day, time: Date.UTC(year, month - 1, day) };
}

function compareRows(a: string[], b: string[]): number {
  return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2].localeCompare(b[2]);
}

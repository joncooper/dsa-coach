from collections import defaultdict
from datetime import date, timedelta
import calendar


def recurring_transactions(transactions: list[list[str]]) -> list[list[str]]:
    groups = defaultdict(list)
    for date_text, merchant, amount, currency in transactions:
        groups[(merchant, amount, currency)].append(parse_date(date_text))

    out = []
    for (merchant, amount, currency), dates in groups.items():
        dates = sorted(set(dates))
        best = best_cadence(dates)
        if best:
            out.append([merchant, amount, currency, best])

    return sorted(out, key=lambda row: (row[0], row[1], row[2]))


def best_cadence(dates: list[date]) -> str:
    candidates = [
        ("DAILY", longest_streak(dates, lambda a, b: b == a + timedelta(days=1))),
        ("WEEKLY", longest_streak(dates, lambda a, b: b == a + timedelta(days=7))),
        ("MONTHLY", longest_streak(dates, is_next_month)),
    ]
    candidates = [candidate for candidate in candidates if candidate[1] >= 3]
    if not candidates:
        return ""
    return max(candidates, key=lambda item: (item[1], -["DAILY", "WEEKLY", "MONTHLY"].index(item[0])))[0]


def longest_streak(dates: list[date], follows) -> int:
    if not dates:
        return 0
    best = 1
    current = 1
    for prev, curr in zip(dates, dates[1:]):
        if follows(prev, curr):
            current += 1
        else:
            current = 1
        best = max(best, current)
    return best


def is_next_month(prev: date, curr: date) -> bool:
    year = prev.year + (1 if prev.month == 12 else 0)
    month = 1 if prev.month == 12 else prev.month + 1
    if curr.year != year or curr.month != month:
        return False
    if prev.day == curr.day:
        return True
    return is_month_end(prev) and is_month_end(curr)


def is_month_end(day: date) -> bool:
    return day.day == calendar.monthrange(day.year, day.month)[1]


def parse_date(value: str) -> date:
    year, month, day = map(int, value.split("-"))
    return date(year, month, day)

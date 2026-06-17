# Ramp SWE Interview Study Guide

Last checked: 2026-06-01.

Status: historical interview-prep research note. This file explains the source
material behind the Ramp practice modes; use [`../README.md`](../README.md) for
current app setup and architecture.

This guide summarizes public 1Point3Acres / 一亩三分地 signals for Ramp SWE
interviews after the CodeSignal stage. Many detailed posts are login- or
points-gated, so this file intentionally separates visible public signals from
inference. Treat this as a prioritization guide, not a guarantee of what will
appear.

It also includes visible topic names from a user-provided InterviewDB screenshot.
Locked/blurred rows are not reconstructed here, but visible rows are expanded
into concrete practice drills.

It also incorporates the visible PracHub Ramp Coding & Algorithms list, updated
2026-06-01. That list is especially useful because it clusters multiple
separate URL maze / crawler variants under Ramp.

## Main Signal

The strongest current signal is a practical technical screen around URL/API
graph traversal. Recent reports and the PracHub Ramp coding list describe
variants of:

- Calling a starting URL or endpoint.
- Inspecting the response shape during the interview.
- Following returned URL(s) until an exit/success condition appears.
- Handling real HTTP messiness: timeouts, retries, `50x`, `404`, `401`, and
  response-format details.
- Using BFS or DFS with a visited set.

This is not a classic LeetCode-style puzzle. It is closer to a small production
task where the interviewer wants to see whether you can discover an API shape,
write simple robust code, avoid cycles, handle failures, and explain tradeoffs.

The practical takeaway: make URL/API traversal your highest-priority live-coding
drill. The next tier is stateful in-memory systems: recipe manager, task
manager, flight tracking, recurring transactions, spreadsheet, subscription
tracking, and banking-style ledgers.

## Extracted Public Signals

| Signal | Public source wording or topic | Clarified meaning |
| --- | --- | --- |
| High-priority tech screen | URL graph traversal, web crawler challenge, recursive URL fetching, URL maze | Be ready to call endpoints, parse responses, traverse returned links, stop at success, and handle retries/status codes. |
| Recent follow-up pattern | `503`, `504`, `404`, `401`, passkey/auth-like handling | Do not write a toy `requests.get(url).json()` solution only. Build a small fetch wrapper with timeout, bounded retry, and status handling. |
| Practicality over algorithms | Reports say BFS/DFS is enough, but the endpoint is real or interviewer-provided | The core algorithm is simple; the hard part is robustness, debugging, and communication. |
| System design screen | Hotel reservation / Expedia-style room availability | Prepare low-latency availability, reservations, consistency, caching, and race conditions. |
| Older backend technical screen | Spreadsheet / Excel-like cell `get` and `set`, with values or formulas | Practice dependency graphs, recalculation, cycle detection, and reverse dependencies. |
| Older product-ish coding/design | Google Calendar-like app: create, edit, delete events | Practice API/data model design for events, recurrence, conflicts, and update semantics. |
| Data/timeline coding screen | Determine user location at a given time from flight records | Practice interval/timeline modeling and careful boundary cases. |
| Final round shape | Coding, system design, cross-functional, hiring manager | Expect more than code: explain product impact, tradeoffs, collaboration, and ownership. |
| Behavioral/video screen | Short Hireflix-style questions on programming background, explaining CS concepts, Ramp fit, AI usage, and project leadership | Prepare crisp 60-90 second answers. |
| OA background | CodeSignal ICF/progressive OOD tasks: recipe manager, filesystem/cloud storage, banking, DB, worker/working-hours style tasks | You already passed CodeSignal, but these remain useful as warmups for practical state modeling. |
| Frontend-specific variants | Wordle or small single-screen app | Relevant if interviewing frontend; state management and correctness matter more than styling. |

## InterviewDB Screenshot Signals

Visible topic names from the screenshot:

| Topic | Tags shown | Freshness shown | How to interpret it |
| --- | --- | --- | --- |
| Subscription Tracking | Coding, Phone, Onsite | 1 month ago | Stateful subscription/billing ledger; likely date intervals, plan changes, and revenue calculations. |
| Spreadsheet | Coding, Phone, Onsite | 1 month ago | Matches the spreadsheet dependency topic from other sources; treat as high-value prep. |
| Flights Tracking | Coding, Phone, Onsite | 1 month ago | Matches the flight timeline/location topic from other sources; treat as high-value prep. |
| Calendar View | Frontend, Coding, Phone | 1 month ago | Likely UI/state task for rendering calendar events and overlaps. |
| Calendar | Coding, Phone, Onsite | Not visible in screenshot | Likely backend calendar/event CRUD; overlaps with calendar design drill. |
| Word Length Distribution | Coding, Onsite | 6 months ago | Text processing / histogram / sorting output formatting. |
| CSV Queries | Coding, Phone, Onsite | 6 months ago | Parse CSV-like rows and answer query/filter/aggregate operations. |
| Currency CLI | Coding, Phone, Onsite | 6 months ago | Command-line app around currency conversion, formatting, or exchange graph traversal. |
| Bank Automation | Coding, OA | 6 months ago | Banking progressive/OA style task; similar to ledger/scheduled-payment drills. |
| Rock Paper Scissors | Coding, Onsite | 6 months ago | String parsing/state validation/game scoring; likely not algorithmically hard. |
| Tracker | System Design, Onsite | 2 weeks ago | Product/event tracking system design; likely analytics/event ingestion. |
| AI Live Coding | AI-Assisted, Coding, Onsite | 3 weeks ago | Live coding where AI assistance may be expected or allowed; practice prompt discipline and verification. |

The newest and strongest visible items are still practical systems: URL/API
traversal from 1Point3Acres, plus InterviewDB's subscription tracking,
spreadsheet, flights tracking, calendar, and tracker topics.

## PracHub Coding List Signals

The PracHub Ramp Coding & Algorithms category page shows 11 visible results as
of 2026-06-01. Four of those are URL maze / crawler variants, which reinforces
the API traversal signal.

| PracHub topic | Difficulty / round shown | How to interpret it |
| --- | --- | --- |
| Find an Exit in a URL Maze | Medium, technical screen | BFS/DFS over URL rooms with cycles, `503` retries, `401` handling, and authorization keys. |
| Find final URL by crawling until "congrats" | Hard, technical screen | Realistic crawler: log responses, parse returned URL lists, retry `503`, return the URL that produces success. |
| Find exit URL via BFS API calls | Medium, technical screen | BFS over API paths with `next_step` arrays, transient `500`, timeouts, and path normalization. |
| Navigate maze via HTTP API | Medium, technical screen | Simpler functional graph: follow one next URL until `END:<result>`, `LOOP`, or `INVALID`. |
| Track Users From Flight History | Hard, technical screen | Temporal event processing: count flights per user and compute every user's location/status at a query time. |
| Detect recurring transactions from a ledger | Hard, technical screen | Group transaction streams and detect daily, weekly, or monthly recurrence patterns. |
| Implement a multi-level digital recipe manager | Medium, take-home project | Progressive in-memory OOD: CRUD, search/sort, users, edits, version history, rollback. |
| Implement multi-level task manager APIs | Medium, take-home project | Progressive in-memory system: task CRUD, prioritized search, users, quotas, assignments, completion, overdue detection. |
| Build a Wordle-style game in React | Medium, take-home project | Frontend state and duplicate-letter matching; likely role-dependent. |
| Build a simplified Wordle game in React | Medium, locked | Same family as Wordle-style game; duplicate signal. |
| Implement wildcard querySelector to extract URL | Medium, locked | DOM traversal / selector-matching problem; likely extract hidden URL characters from nested elements. |

Priority based on this page:

1. URL maze/crawler variants.
2. Temporal/stateful systems: flights, recurring transactions, task manager.
3. Progressive OOD: recipe manager, task manager, banking/filesystem/database.
4. Frontend-only variants: Wordle and calendar view.
5. DOM/querySelector extraction as a smaller parsing/traversal drill.

## Additional Suspects From Secondary Research

Gemini identified two additional suspects worth preparing: rate limiting and
ledger reconciliation. The evidence is mixed:

- API maze / URL crawler remains the strongest confirmed signal because it
  appears repeatedly in public Ramp interview snippets and third-party question
  indexes.
- Rate limiter is plausible. Ramp has a public engineering article about a
  Redis-backed rate limiter, and rate limiting is a classic live-coding/system
  design bridge problem. This does not prove it is a current Ramp interview
  question, but it is a high-value prep topic.
- Ledger reconciliation is plausible for a fintech company, but the public
  coding signal found during research points more specifically to recurring
  transaction detection from a ledger. Prepare both, but label reconciliation as
  a domain-plausible extension rather than confirmed.

| Topic | Confidence | Why it matters |
| --- | --- | --- |
| API Maze Crawler | High | Repeated public interview/forum signal; practical API traversal task. |
| Rate Limiter | Medium | Public Ramp engineering article and API docs make it credible and relevant. |
| Recurring Transaction Detection | Medium | Public Ramp-labeled coding question exists; ledger/time-series fit. |
| Ledger Reconciliation | Low-medium | Fintech-relevant and useful, but less directly supported by visible Ramp-specific sources. |

## Expanded Practice Versions

The following are synthesized study drills built from the public signals above.
They are not copied interview prompts. Use them as concrete, self-contained
versions of the topic families so you can practice without relying on vague
paraphrases.

### Drill A: URL Maze / API Graph Traversal

You are given a `start_url`. Each URL returns one of several response shapes:

```json
{"next": "https://example.com/node/123"}
{"links": ["https://example.com/a", "https://example.com/b"]}
{"message": "keep going", "children": ["/relative/path"]}
{"status": "success", "answer": "Congrats"}
```

Some URLs may return plain text instead of JSON. A terminal success response
contains the word `Congrats` or a JSON field such as `"status": "success"`.

Write:

```python
def find_congrats(start_url: str) -> str | None:
    ...
```

Return the first success answer you can find, or `None` if the reachable graph is
exhausted.

Expected behavior:

- Use BFS or DFS.
- Track visited URLs.
- Handle relative URLs with `urllib.parse.urljoin`.
- Use `requests.get(..., timeout=...)`.
- Retry `429`, `500`, `502`, `503`, and `504` a bounded number of times.
- Skip `404`.
- Treat `401` / `403` as a signal to inspect the response for an auth hint,
  token, passkey, or header requirement.
- Do not assume every response is JSON.
- Do not retry forever.

Good interview extension:

- First implement with a provided fake `fetch(url)` function.
- Then adapt it to real HTTP.
- Then add status handling.
- Then add response-shape discovery.

What this demonstrates:

- Graph traversal.
- Defensive IO handling.
- API discovery.
- Clear separation between `fetch`, `parse`, and `traverse`.
- Calm debugging when the service behaves inconsistently.

### Drill B: URL Maze With Passkey Follow-Up

Same as Drill A, but one endpoint returns:

```json
{"auth": {"header": "X-Passkey", "value": "abc123"}, "next": "/locked"}
```

Future requests to locked URLs must include:

```python
headers={"X-Passkey": "abc123"}
```

Expected behavior:

- Keep traversal state plus request context.
- Do not hard-code the token name.
- If a response updates auth context, use it for future fetches.
- Make it clear whether auth applies globally or only to descendants.

Reasonable simple solution:

- Keep a mutable `headers` dict.
- When a response includes auth data, update the dict.
- Use the current dict for later requests.

More robust solution:

- Store `(url, headers_context)` in the queue if auth is path-dependent.
- Use a visited key like `(url, frozen_headers)` if the same URL can produce
  different results under different credentials.

### Drill C: Hotel Room Availability System Design

Design the backend for a hotel booking site. Users search hotels by destination
and date range, inspect room availability, place a short hold, confirm booking,
cancel booking, and modify dates.

Functional requirements:

- Search available hotels for `[check_in, check_out)`.
- Filter by city, guest count, room type, price, and hotel metadata.
- Show available room count for a room type.
- Place a temporary hold while the user checks out.
- Confirm a hold into a reservation.
- Cancel a reservation and restore inventory.
- Prevent overbooking under concurrent requests.

Non-functional requirements:

- Search should be low latency.
- Booking correctness is more important than search freshness.
- The system should tolerate user retries.
- Inventory should remain auditable.

Core tables:

```text
hotels(id, city, name, metadata)
room_types(id, hotel_id, capacity, name, attributes)
inventory(room_type_id, date, total, held, booked)
holds(id, user_id, room_type_id, check_in, check_out, expires_at, status)
reservations(id, user_id, room_type_id, check_in, check_out, status)
```

Booking flow:

1. Search reads cached or indexed availability.
2. Hold attempts to increment `held` for every date in the range inside a
   transaction, only if `held + booked < total` for all dates.
3. Confirm converts hold to booking: decrement `held`, increment `booked`.
4. Cancel decrements `booked`.
5. Expired holds are released by a background job.

Important tradeoff:

- Search can be eventually consistent.
- Hold/confirm must be strongly consistent enough to prevent overbooking.

Expected discussion:

- Why inventory is per date, not just per hotel.
- How date ranges overlap.
- How to use idempotency keys for retry safety.
- How to cache search without trusting cache at booking time.
- How to handle concurrent writes.

### Drill D: Spreadsheet Cells With Dependencies

Implement a 26-by-100 spreadsheet. Cells are named `A1` through `Z100`.

Operations:

```python
set_cell("A1", "5")
set_cell("B1", "7")
set_cell("C1", "=A1+B1")
get_cell("C1")  # 12
```

Inputs may be:

- Integer literal: `"5"`
- String literal: `"hello"`
- Formula: `"=A1+B1"` or `"=A1+10"`

Expected behavior:

- `set_cell` replaces the previous contents of the cell.
- `get_cell` returns the current computed value.
- Formulas reference other cells.
- Updating `A1` changes the computed value of `C1`.
- Cycles are invalid: `A1 = B1`, `B1 = A1`.

Level 1:

- Implement literal `set` and `get`.

Level 2:

- Add formulas with one `+`.

Level 3:

- Add formulas with multiple terms.

Level 4:

- Add dependency tracking and cycle detection.

Good simple approach:

- Store raw cell content in `cells`.
- Evaluate lazily on `get`.
- During evaluation, keep a `visiting` set for cycle detection.
- If performance becomes a follow-up, add reverse dependency invalidation.

### Drill E: Calendar Event CRUD

Design and implement a small calendar service.

Operations:

```python
create_event(user_id, start, end, title, attendees=[])
update_event(event_id, start=None, end=None, title=None, attendees=None)
delete_event(event_id)
list_events(user_id, window_start, window_end)
```

Requirements:

- Events have start and end timestamps.
- Events can have multiple attendees.
- `list_events` returns events overlapping a time window.
- Updates should preserve fields that are not changed.
- Deleting an event removes it from future list results.

Follow-ups:

- Detect conflicts for a user.
- Support recurring events.
- Send notifications to attendees.
- Support changing one instance of a recurring event.
- Support permission rules: owner, attendee, admin.

Good data model:

```text
events(id, owner_id, start, end, title, status)
event_attendees(event_id, user_id, response_status)
recurrence_rules(event_id, rule)
event_exceptions(event_id, occurrence_start, override_event_id)
```

Expected discussion:

- Overlap condition: `event.start < window_end and window_start < event.end`.
- Recurrence expansion should be bounded by query window.
- Updates and deletes need authorization.
- Notifications should be async.

### Drill F: Flight Timeline User Location

You are given flight records:

```python
Flight(
    user_id="u1",
    depart_airport="SFO",
    depart_time=100,
    arrive_airport="JFK",
    arrive_time=200,
)
```

Implement:

```python
def location_at(flights, user_id, query_time):
    ...
```

Return one of:

- The airport where the user is located.
- `"IN_FLIGHT"` if the user is currently flying.
- `None` if the user's location is unknown.

Rules:

- A user is in flight during `[depart_time, arrive_time)`.
- At `arrive_time`, the user is at `arrive_airport`.
- If the query is after one flight and before the next, the user remains at the
  last arrival airport.
- If the query is before the user's first known flight, location is unknown
  unless an initial location is provided.

Expected implementation:

- Filter or group flights by user.
- Sort by `depart_time`.
- Scan for interview simplicity, or binary search if asked.
- Be explicit about boundaries.

Follow-ups:

- Detect invalid overlapping flights.
- Support cancelled flights.
- Support time zones.
- Return the active flight object instead of `"IN_FLIGHT"`.

### Drill G: Recipe Manager Progressive OOD

Build a recipe manager from a list of operations.

Possible levels:

1. Add a recipe with a name and ingredients.
2. Retrieve a recipe by name.
3. Add user ratings and return top recipes by average rating.
4. Version recipes so edits preserve history.

Good internal model:

```python
@dataclass
class RecipeVersion:
    version: int
    ingredients: list[str]
    instructions: str
    created_at: int

@dataclass
class Recipe:
    name: str
    versions: list[RecipeVersion]
    ratings: list[int]
```

Things to practice:

- Stable IDs vs mutable names.
- Sorting by score with deterministic tie-breakers.
- Returning exact strings requested by the prompt.
- Keeping version history separate from current version.

### Drill H: Filesystem / Cloud Storage Progressive OOD

Build an in-memory file storage service.

Possible levels:

1. `add_file(path, size)` and `get_file_size(path)`.
2. `copy_file(source, dest)`.
3. `find(prefix, suffix)` returning matching files sorted by size/name.
4. Add users with quotas.
5. Add compression, decompression, or ownership transfer.

Good internal model:

```python
@dataclass
class File:
    path: str
    size: int
    owner: str
    compressed: bool = False
```

Common traps:

- Copy should preserve or intentionally define ownership.
- Quota should account for all files owned by the user.
- Prefix/suffix matching should be path-string based unless directories are
  explicitly modeled.
- Compression should not accidentally allow duplicate logical paths.
- Sorting should match the spec exactly.

### Drill I: Banking / Ledger Progressive OOD

Build a small banking system.

Possible levels:

1. Create accounts and deposit.
2. Transfer between accounts.
3. Rank accounts by outgoing transaction volume.
4. Schedule payments and process due payments.
5. Merge accounts or support cashback/refunds.

Good internal model:

```python
@dataclass
class Account:
    id: str
    balance: int = 0
    outgoing_total: int = 0

@dataclass
class ScheduledPayment:
    id: str
    account_id: str
    amount: int
    due_at: int
    created_order: int
    cancelled: bool = False
```

Common traps:

- Convert money strings to integers immediately.
- Process scheduled payments before the operation at the same timestamp if the
  spec says so.
- Preserve creation order for same-time scheduled payments.
- Keep failed payment semantics clear: skipped, retried, or cancelled.
- Do not use tuple fields for scheduled payments if you keep mixing up indexes.

### Drill J: In-Memory DB With TTL

Build a simple key-field-value database.

Possible operations:

```python
set(key, field, value)
get(key, field)
delete(key, field)
scan(key)
set_at_with_ttl(key, field, value, timestamp, ttl)
get_at(key, field, timestamp)
```

Good internal model:

```python
@dataclass
class Entry:
    value: str
    expires_at: int | None = None
```

Represent records as:

```python
db: dict[str, dict[str, Entry]]
```

Common traps:

- Expiry boundary: if `expires_at == timestamp`, decide whether expired.
- `scan` should hide expired values.
- Updating a field should replace both value and expiry.
- Deleting a missing field should return the exact requested falsey response.
- Keep cleanup optional; correctness can be enforced by checking expiry on read.

### Drill K: Working Hours Register

Build a worker time-tracking system.

Possible levels:

1. Add workers and register enter/exit timestamps.
2. Return total time worked.
3. Promote workers to new positions with compensation.
4. Compute salary over a time range, including position changes and bonus or
   double-pay intervals.
5. Return top workers by time in current position.

Good internal model:

```python
@dataclass
class Session:
    start: int
    end: int | None
    position: str
    rate: int

@dataclass
class Worker:
    id: str
    current_position: str
    current_rate: int
    sessions: list[Session]
```

Common traps:

- Open sessions should usually not count until closed.
- Promotion may apply at the next entry, not immediately, depending on spec.
- Salary range overlap requires interval intersection.
- Current-position ranking should only count sessions worked in the current
  position, not lifetime total, if the spec says current position.
- Merge overlapping bonus intervals before computing salary.

### Drill L: Wordle / Single-Screen Frontend App

Build a small Wordle-like game.

Requirements:

- User enters guesses.
- Each guess is validated against answer length.
- Display per-letter feedback: correct position, present elsewhere, absent.
- Support duplicate letters correctly.
- Show win/loss state.
- Disable input after game over.
- Provide reset.

Duplicate-letter rule:

- First mark exact matches.
- Then count remaining unmatched letters in the answer.
- Mark present letters only while remaining count is positive.

What interviewers likely care about:

- State transitions are clear.
- Edge cases are handled.
- Components are not tangled.
- You can debug broken tests or unclear scaffolding.

### Drill M: Subscription Tracking

Build a subscription tracking service. Customers can subscribe, change plans,
cancel, and generate invoices.

Operations:

```python
subscribe(customer_id, plan_id, start_date)
change_plan(customer_id, new_plan_id, effective_date)
cancel(customer_id, cancel_date)
invoice(customer_id, period_start, period_end)
active_subscribers(date)
monthly_recurring_revenue(date)
```

Plan data:

```python
Plan(id="basic", monthly_price_cents=1000)
Plan(id="pro", monthly_price_cents=3000)
```

Expected behavior:

- A customer can have at most one active subscription at a time.
- Plan changes take effect on their effective date.
- Cancellation ends service on the cancellation date or period end, depending on
  the chosen rule.
- Invoices prorate charges by day if the prompt asks for prorating.
- Revenue at a point in time is based on active subscriptions and current plans.

Good internal model:

```python
@dataclass
class SubscriptionEvent:
    customer_id: str
    kind: str
    plan_id: str | None
    effective_date: int

@dataclass
class SubscriptionSegment:
    start: int
    end: int | None
    plan_id: str
```

Interview-simple approach:

- Store events per customer.
- Sort events by effective date.
- Convert events into non-overlapping subscription segments.
- Answer invoice/revenue questions by intersecting segments with the query
  period.

Common traps:

- Mixing inclusive and exclusive date boundaries.
- Forgetting prorating when a plan changes mid-period.
- Counting cancelled subscriptions as active.
- Treating monthly price as daily price without clarifying conversion.
- Not defining tie-breakers for multiple events on the same date.

### Drill N: Calendar View Frontend

Build a calendar-day view that renders events in a vertical timeline.

Input:

```ts
type Event = {
  id: string;
  title: string;
  startMinutes: number; // minutes after midnight
  endMinutes: number;
};
```

Requirements:

- Render events at the correct vertical position.
- Height should reflect duration.
- Overlapping events should appear side by side.
- Non-overlapping events can use full width.
- Events ending exactly when another starts are not overlapping.
- Support selecting an event.
- Support adding or editing an event.

Core overlap rule:

```text
a.start < b.end and b.start < a.end
```

Good implementation approach:

- Sort events by start time.
- Partition events into overlap groups.
- Within each group, assign each event to the first column whose previous event
  has ended.
- Width is `1 / column_count` for the group.
- Left offset is `column_index / column_count`.

What this demonstrates:

- Frontend state modeling.
- Interval reasoning.
- Pixel/layout math.
- Clean handling of edge boundaries.

### Drill O: Word Length Distribution

Given text, return a word-length histogram.

Example:

```python
word_length_distribution("hi there, brave new world")
# {2: 1, 3: 1, 5: 2, 6: 1}
```

Clarify:

- Are words split only on whitespace, or punctuation too?
- Are numbers words?
- Is case relevant?
- Should contractions count as one word?
- What output format is required: dict, sorted list, string table?

Possible follow-ups:

- Return the most common word length.
- Return the top `k` lengths.
- Stream large input without storing all words.
- Group by first letter and word length.
- Ignore stop words.

Good solution shape:

```python
from collections import Counter
import re

def distribution(text):
    words = re.findall(r"[A-Za-z0-9']+", text)
    return dict(Counter(len(word) for word in words))
```

Common traps:

- Letting punctuation change lengths unexpectedly.
- Returning unsorted output when tests expect sorted output.
- Mishandling empty input.

### Drill P: CSV Queries

Build a tiny query engine over CSV data.

Input:

```text
id,name,team,amount
1,Ada,eng,10
2,Lin,design,25
3,Grace,eng,15
```

Operations:

```python
select(columns=["name", "amount"])
where(column="team", op="=", value="eng")
order_by(column="amount", direction="desc")
sum(column="amount")
count()
```

Expected behavior:

- Parse headers.
- Preserve string values unless a numeric operation requires conversion.
- Support filtering rows by column values.
- Support aggregation.
- Return deterministic row order.

Good implementation approach:

- Use Python's `csv.DictReader`.
- Represent rows as `list[dict[str, str]]`.
- Convert inside aggregation/comparison helpers, not randomly throughout the
  code.

Common traps:

- Splitting CSV with `line.split(",")` when quoted commas are possible.
- Comparing numeric strings lexicographically: `"100" < "20"`.
- Losing column order.
- Not handling missing columns with useful errors.

### Drill Q: Currency CLI

Build a command-line currency converter.

Input exchange rates:

```text
USD,EUR,0.9
EUR,JPY,160
USD,CAD,1.35
```

Command:

```text
convert 100 USD JPY
```

Expected behavior:

- Return converted amount if a path exists.
- Direct rates and inverse rates should both work if the prompt allows inverse
  conversion.
- If no path exists, return a clear error.
- Format money consistently.

Graph model:

- Node: currency.
- Edge: exchange rate.
- Conversion along path: multiply rates.

Example:

```text
100 USD -> EUR -> JPY = 100 * 0.9 * 160 = 14400 JPY
```

Good solution shape:

- Build adjacency list.
- Add inverse edge if allowed: `EUR -> USD = 1 / 0.9`.
- BFS/DFS from source to target while carrying accumulated rate.
- Use `decimal.Decimal` if precision matters.

Follow-ups:

- Detect arbitrage cycles.
- Support rate updates.
- Support historical rates by timestamp.
- Read rates and commands from files.

### Drill R: Rock Paper Scissors

Implement a rock-paper-scissors match scorer.

Input examples:

```text
Alice: rock
Bob: scissors
```

or:

```python
[("Alice", "R"), ("Bob", "S"), ("Alice", "P")]
```

Expected behavior:

- Validate moves.
- Score each round.
- Track total wins/losses/ties.
- Return winner or leaderboard.

Rules:

```python
beats = {
    "rock": "scissors",
    "scissors": "paper",
    "paper": "rock",
}
```

Possible follow-ups:

- Add lizard/spock.
- Parse messy input strings.
- Support tournament brackets.
- Support best-of-N matches.
- Detect invalid duplicate moves in a round.

What this likely tests:

- Clean parsing.
- Small state machines.
- Exact output formatting.
- Not overengineering a simple task.

### Drill S: Tracker System Design

Design an event tracking system for product analytics.

Requirements:

- Clients send events such as `page_view`, `button_click`, or `purchase`.
- Events include user ID, session ID, timestamp, event type, and properties.
- Product teams query funnels, counts, retention, and active users.
- Ingestion must handle high write volume.
- Queries should be fast enough for dashboards.

Core event shape:

```json
{
  "event_id": "evt_123",
  "user_id": "u1",
  "session_id": "s1",
  "event_type": "purchase",
  "timestamp": 1710000000,
  "properties": {"amount": 50}
}
```

Design points:

- Use `event_id` for idempotency/deduplication.
- Ingest to a durable log or queue.
- Store raw events in object storage or an append-only event store.
- Build aggregate tables for common dashboard queries.
- Partition by time and possibly event type/customer.
- Validate schema but allow flexible properties.
- Separate hot real-time aggregates from cold historical analysis.

Expected discussion:

- At-least-once ingestion and deduplication.
- Late-arriving events.
- Privacy/deletion requirements.
- Multi-tenant data isolation.
- Backfilling aggregates after schema changes.

### Drill T: AI-Assisted Live Coding

Practice live coding with AI assistance as a constrained workflow.

Rules for yourself:

- Ask AI for a plan or edge cases, not a blind final answer.
- Keep the code small enough that you can explain every line.
- Run tests after each meaningful edit.
- Use AI to generate extra tests.
- Reject suggestions that change the problem model without justification.

Good interview narration:

- "I am going to use AI to sanity-check edge cases, then I will implement and
  verify the code myself."
- "This suggestion introduces more abstraction than the task needs, so I am
  keeping the simpler version."
- "I want to test the boundary where one interval ends exactly when another
  starts."

What this demonstrates:

- Judgment.
- Verification discipline.
- Ability to own code even when assisted.
- Clear communication about uncertainty.

### Drill U: Single-Machine Rate Limiter

Implement:

```python
class RateLimiter:
    def allow(self, key: str, timestamp_ms: int) -> bool:
        ...
```

The limiter should allow at most `limit` requests per `window_ms` for each key.

Example:

```python
limiter = RateLimiter(limit=3, window_ms=1000)
limiter.allow("user-1", 0)     # True
limiter.allow("user-1", 100)   # True
limiter.allow("user-1", 200)   # True
limiter.allow("user-1", 300)   # False
limiter.allow("user-1", 1001)  # True
```

Sliding-window log approach:

```python
from collections import defaultdict, deque

class RateLimiter:
    def __init__(self, limit, window_ms):
        self.limit = limit
        self.window_ms = window_ms
        self.requests = defaultdict(deque)

    def allow(self, key, timestamp_ms):
        q = self.requests[key]
        cutoff = timestamp_ms - self.window_ms

        while q and q[0] <= cutoff:
            q.popleft()

        if len(q) >= self.limit:
            return False

        q.append(timestamp_ms)
        return True
```

Clarify boundary:

- If the window is `(timestamp - window, timestamp]`, remove timestamps
  `<= timestamp - window`.
- If the window is `[timestamp - window, timestamp]`, remove timestamps
  `< timestamp - window`.

Follow-ups:

- Fixed window counter: simpler, but permits boundary bursts.
- Sliding window counter: less memory than log, approximate.
- Token bucket: supports configurable burst and refill rate.
- Leaky bucket: smooths output rate.
- Distributed Redis-backed limiter: needs atomic read/modify/write.

What to say:

- "For live coding, I will start with sliding-window log because it is exact and
  simple."
- "Memory is proportional to the number of accepted requests still inside the
  active windows."
- "For distributed use, local dictionaries break behind multiple app servers."
- "In Redis I would use sorted sets or a Lua script so prune/count/insert is
  atomic."

Common traps:

- Off-by-one window boundaries.
- Using wall-clock time inside tests instead of accepting `timestamp`.
- Forgetting to separate users/API keys.
- Letting denied requests consume capacity unless the prompt says they should.
- Race conditions in a distributed implementation.

### Drill V: Distributed Rate Limiter Design

Design a rate limiter for an API used by many tenants and deployed across many
application servers.

Requirements:

- Limit by API key, user, tenant, route, or any combination.
- Return `429` when over limit.
- Support different limits per plan.
- Keep latency low enough to sit on the request path.
- Work across multiple app instances.
- Handle Redis/cache failures intentionally.

Redis sorted-set approach:

```text
key = rate_limit:{tenant}:{route}
ZREMRANGEBYSCORE key -inf now-window
ZCARD key
if count < limit:
  ZADD key now request_id
  EXPIRE key window
  allow
else:
  deny
```

Important: those Redis operations must be atomic, typically via Lua or a Redis
transaction with appropriate care. Otherwise concurrent requests can all observe
capacity and overshoot.

Design choices:

- Fail open: preserve product availability but risk overload/abuse.
- Fail closed: protect downstream systems but may block legitimate traffic.
- Local fallback: useful for short Redis outages, but can over-admit globally.
- Per-region quotas: lower latency, approximate global limits.
- Global Redis: stronger coordination, higher latency or availability risk.

Expected discussion:

- Fixed window vs sliding window vs token bucket vs GCRA.
- Burst tolerance.
- Hot keys.
- Multi-region deployment.
- Observability: allowed/denied counts, near-limit warnings, retry-after.
- Config management and rollout safety.

### Drill W: Recurring Transaction Detection

Given a ledger of transactions:

```python
Transaction(
    date="2024-01-05",
    merchant="Netflix",
    amount_cents=3000,
    currency="USD",
)
```

Find recurring transaction groups.

Baseline rule:

- Group by `(merchant, amount, currency)`.
- A group is recurring if it has at least 3 transactions matching one of:
  daily, weekly, monthly.
- Daily means adjacent dates differ by 1 day.
- Weekly means adjacent dates differ by 7 days.
- Monthly means next calendar month with the same day-of-month, or both dates
  are month-end.

Return:

```python
[("Gym", 2500, "USD", "WEEKLY"), ("Netflix", 3000, "USD", "MONTHLY")]
```

Good implementation approach:

- Parse dates to `datetime.date`.
- Group transactions by merchant/amount/currency.
- Sort dates inside each group.
- For each cadence, compute the longest adjacent streak.
- Require streak length >= 3.
- Sort output deterministically.

Follow-ups:

- Allow amount tolerance, such as within 1%.
- Allow date jitter, such as monthly bills within +/- 2 days.
- Normalize merchant names.
- Detect multiple subscriptions from the same merchant at different prices.
- Work with 100k+ transactions.

Common traps:

- Floating-point money.
- Treating 30 days as a month.
- Missing end-of-month behavior: Jan 31, Feb 29, Mar 31.
- Counting irregular repeated purchases as subscriptions.
- Mixing currencies.

### Drill X: Ledger Reconciliation

Given internal transactions and external bank-feed transactions, produce a
reconciliation report.

Internal:

```python
InternalTxn(id="i1", date="2026-05-28", amount_cents=-5000, merchant="AWS")
```

External:

```python
ExternalTxn(id="b99", date="2026-05-29", amount_cents=-5000,
            description="AMAZON WEB SERVICES")
```

Output:

```python
ReconciliationReport(
    matches=[("i1", "b99")],
    missing_internal=["..."],
    missing_external=["..."],
    discrepancies=[...],
)
```

Level 1:

- Match exact amount and exact date.
- Each transaction can be used at most once.

Level 2:

- Allow date drift of `+/- 2` days.
- Prefer exact date over drifted date.
- If multiple candidates match, use deterministic tie-breakers.

Level 3:

- Add merchant normalization:
  `AWS` should plausibly match `AMAZON WEB SERVICES`.
- Keep the heuristic simple and explain limitations.

Level 4:

- Support many-to-one matching where several internal line items sum to one
  external transaction within the date window.

Good implementation approach:

- Convert all money to integer cents at input boundaries.
- Sort by date.
- Index external transactions by amount and date bucket for exact matching.
- For fuzzy date matching, search only the small date window.
- Mark matched IDs in a set.
- For many-to-one, only attempt subset search inside a small candidate window.

Common traps:

- Using floats for money.
- Allowing one transaction to match multiple times.
- Nondeterministic output ordering.
- Trying global subset-sum too early.
- Overfitting merchant fuzzy matching before exact numeric matching works.

What to say:

- "I will start with deterministic exact matching, then layer tolerances."
- "Amount and date are stronger signals than merchant text."
- "I will keep inputs immutable and track matched IDs separately."
- "For many-to-one, I will constrain the search window before considering
  subset sums."

### Drill Y: Multi-Level Task Manager APIs

Build an in-memory task management system with APIs that evolve over levels.
Every API receives a `timestamp: int`. Assume timestamps are non-decreasing
unless the interviewer says otherwise.

Task IDs:

```text
task_id_1, task_id_2, task_id_3, ...
```

Task data:

```python
@dataclass
class Task:
    id: str
    name: str
    priority: int
    created_order: int
```

Level 1: task CRUD

```python
add_task(timestamp, name, priority) -> task_id
update_task(timestamp, task_id, name, priority) -> bool
get_task(timestamp, task_id) -> str | None
```

`get_task` may need to return a compact JSON string with fields in exact order,
such as:

```json
{"name":"write docs","priority":5}
```

Level 2: search and sorting

```python
search_tasks(timestamp, name_filter, max_results) -> list[str]
list_tasks_sorted(timestamp, limit) -> list[str]
```

Rules:

- `name_filter` is a case-sensitive substring match unless clarified.
- Sort by priority descending.
- Tie-break by creation order ascending.
- If the limit is `<= 0`, return `[]`.

Level 3: users and quota-based assignments

```python
add_user(timestamp, user_id, quota) -> bool
assign_task(timestamp, task_id, user_id, finish_time) -> bool
get_user_tasks(timestamp, user_id) -> list[str]
```

Assignment model:

```python
@dataclass
class Assignment:
    task_id: str
    user_id: str
    start: int
    finish: int
    completed_at: int | None = None
```

Rules:

- Assignment interval is `[start, finish)`.
- A user's quota is the maximum number of simultaneously active assignments.
- Active at `t` means `start <= t < finish` and not completed.
- `finish_time <= timestamp` should probably be rejected or clarified.

Level 4: completion and overdue detection

```python
complete_task(timestamp, task_id, user_id) -> bool
get_overdue_assignments(timestamp, user_id) -> list[str]
```

Rules:

- Completion is valid only if the task is actively assigned to that user at the
  completion timestamp.
- Completion immediately frees quota.
- An assignment is overdue if `finish <= timestamp` and it was not completed
  before `finish`.

Good implementation approach:

- Store tasks by ID.
- Store users by ID with quota.
- Store assignments as a list for simplicity.
- Write helper `is_active(assignment, timestamp)`.
- Write helper `active_assignments(user_id, timestamp)`.
- Enforce quota by counting active assignments at the assignment timestamp.
- Keep creation order as an integer, not by parsing IDs everywhere.

Common traps:

- Sorting task IDs lexicographically: `task_id_10` before `task_id_2`.
- Counting completed assignments against quota.
- Treating `finish_time == timestamp` as active; interval is usually half-open.
- Forgetting that completion before finish means not overdue.
- Producing JSON with spaces or key order different from what tests expect.

### Drill Z: Hidden URL From DOM / Wildcard Query Selector

Build a function that extracts a hidden URL from a deeply nested DOM-like tree.
The visible PracHub list names this as a wildcard `querySelector` extraction
problem, so practice it as a DOM traversal and selector-matching task.

Input model:

```python
@dataclass
class Node:
    tag: str
    attrs: dict[str, str]
    text: str
    children: list["Node"]
```

Possible hidden structure:

```html
<section data-id="url-0">h</section>
<section data-id="url-1">t</section>
<section data-id="url-2">t</section>
<section data-id="url-3">p</section>
...
```

Implement:

```python
def query_selector_all(root: Node, selector: str) -> list[Node]:
    ...

def extract_hidden_url(root: Node) -> str:
    ...
```

Practice selector features:

- Tag selector: `div`
- Class selector: `.part`
- ID selector: `#secret`
- Attribute exact match: `[data-kind=url]`
- Attribute prefix match: `[data-id^=url-]`
- Descendant selector: `div .part`
- Wildcard tag: `*`

URL extraction rules:

- Select all matching nodes.
- Sort by numeric index embedded in an attribute such as `data-id="url-12"`.
- Concatenate text content.
- Return the resulting URL string.

Good implementation approach:

- Parse selector into small matcher functions.
- Traverse the tree DFS.
- For descendant selectors, match a node only if its ancestors satisfy the
  earlier selector parts.
- Keep the extraction step separate from selector matching.
- For numeric ordering, use a helper that extracts trailing digits.

Common traps:

- Treating CSS selector parsing as the whole problem; implement only the subset
  required by the prompt.
- Sorting `"url-10"` before `"url-2"` lexicographically.
- Reading only direct text and forgetting text might be nested.
- Matching class names by substring instead of token.
- Getting tangled in full browser DOM behavior; this is likely a simplified
  tree traversal problem.

## Topic 1: URL/API Graph Traversal

### What To Expect

You may be given a starting URL. The endpoint returns either:

- A success marker, such as a text or JSON field indicating completion.
- A list of more URL(s) to fetch.
- A response that requires special handling, such as retryable server errors or
  auth/key information.

Your job is to keep fetching until you find the terminal answer or exhaust the
reachable graph.

### Core Model

Represent the problem as a graph:

- Node: a URL.
- Edge: a returned URL from the current response.
- Goal: a response containing the success condition.
- Hazard: cycles, repeated URLs, flaky responses, unexpected status codes.

The baseline solution is BFS or DFS:

```python
from collections import deque

def find_exit(start_url):
    queue = deque([start_url])
    seen = set()

    while queue:
        url = queue.popleft()
        if url in seen:
            continue
        seen.add(url)

        response = fetch(url)
        data = parse_response(response)

        if is_success(data):
            return extract_answer(data)

        for next_url in extract_next_urls(data):
            if next_url not in seen:
                queue.append(next_url)

    return None
```

### Interview-Ready Fetch Wrapper

Have this shape ready:

```python
import time
import requests

RETRYABLE = {429, 500, 502, 503, 504}

def fetch(url, max_attempts=5, timeout=5):
    last_error = None

    for attempt in range(max_attempts):
        try:
            response = requests.get(url, timeout=timeout)
        except requests.RequestException as exc:
            last_error = exc
            time.sleep(0.1 * (attempt + 1))
            continue

        if response.status_code in RETRYABLE:
            time.sleep(0.1 * (attempt + 1))
            continue

        return response

    if last_error:
        raise last_error
    raise RuntimeError(f"failed to fetch {url}")
```

In the real interview, ask before adding backoff/sleep if they care about speed.
The important thing is to show bounded retry and timeout discipline.

### Status Handling Checklist

- `200`: parse and continue.
- `3xx`: decide whether to follow redirects. `requests` does by default.
- `401` / `403`: ask whether there is an auth token, passkey, or prior response
  field you should use.
- `404`: usually skip the node unless the prompt says it is fatal.
- `429`: retry with a limit.
- `500` / `502` / `503` / `504`: retry with a limit.
- Network exception: retry with a limit.
- Bad JSON: inspect `response.text`; do not assume every response is JSON.

### Response Parsing Checklist

Be ready to support:

- JSON object with `urls`, `links`, `next`, `children`, or similar fields.
- JSON list of URLs.
- Plain text containing a success marker.
- Plain text or HTML containing URL-like substrings.
- A response field that changes how future requests are made.

### What To Say Out Loud

- "I am going to treat URLs as graph nodes and returned URLs as edges."
- "I will track visited URLs to avoid loops."
- "I will isolate fetch/retry behavior from traversal so the graph logic stays
  simple."
- "I will first print or inspect one response to confirm the shape before
  overfitting the parser."
- "I will use BFS unless the interviewer prefers DFS; either is fine if we only
  need to find any exit."

### Common Failure Modes

- No visited set, causing infinite loops.
- Assuming every response is valid JSON.
- No timeout, causing the solution to hang.
- Infinite retry.
- Treating all non-`200` statuses as fatal.
- Not normalizing relative URLs.
- Failing to explain why BFS/DFS is enough.

## Topic 2: Hotel Reservation / Availability System Design

### What To Expect

The visible source describes a hotel reservation system like Expedia with an
emphasis on low-latency room availability, consistency, and caching.

### Core Requirements To Clarify

- Search availability by hotel, room type, date range, guest count, and region.
- Reserve or book rooms without overbooking.
- Cancel or modify bookings.
- Return availability quickly under high read traffic.
- Keep inventory correct under concurrent booking attempts.

### Good Data Model

- `Hotel(id, metadata, region)`
- `RoomType(id, hotel_id, capacity, attributes)`
- `Inventory(room_type_id, date, total_count, reserved_count)`
- `Reservation(id, user_id, room_type_id, start_date, end_date, status)`
- Optional: `Hold(id, room_type_id, date_range, expires_at)` for checkout flow.

### Design Points

- Availability is date-range inventory, not a single scalar.
- Booking must atomically decrement or reserve each date in the range.
- Reads can use cache/materialized availability, but writes need a source of
  truth.
- Use idempotency keys for booking requests.
- Use short-lived holds to avoid long checkout races.
- Decide where consistency matters: booking confirmation must be strongly
  correct; search results can be slightly stale if final booking validates.

### What To Say Out Loud

- "Search can be cached, but confirmation must re-check inventory transactionally."
- "I would model inventory per room type per date because date ranges overlap."
- "I would use idempotency keys for retries so duplicate booking requests do not
  double reserve."
- "I would make stale search acceptable but stale booking confirmation
  unacceptable."

## Topic 3: Spreadsheet / Cell Dependency Coding

### What To Expect

Older reports mention a grid or spreadsheet with `get` and `set`, where a cell
can contain a literal or formula-like dependency on other cells.

### Core Model

- Store each cell's raw expression.
- Store computed values separately if caching.
- Track dependencies: `cell -> cells it reads`.
- Track reverse dependencies: `cell -> cells that read it`.
- On `set`, update dependencies and invalidate or recompute affected cells.

### Key Edge Cases

- Updating a formula should remove old dependency edges.
- A cell may depend on multiple cells.
- A dependency chain can be several cells deep.
- Cycles should be detected or rejected.
- `get` should define whether it computes lazily or returns cached values.

### Simple Strategy

For interview speed, lazy evaluation is often easiest:

```python
def get(cell):
    return evaluate(cell, visiting=set())

def evaluate(cell, visiting):
    if cell in visiting:
        raise ValueError("cycle")
    visiting.add(cell)
    # If literal, return value.
    # If formula, recursively evaluate dependencies.
    visiting.remove(cell)
```

If follow-ups require efficient updates, add reverse dependencies and
invalidation.

## Topic 4: Flight Timeline / User Location

### What To Expect

A visible source describes flight records with departure airport/time, arrival
airport/time, and user ID. The task is to answer where a given user is at a
specific time.

### Core Model

Normalize each flight into intervals:

- Before departure: user is at origin, if known.
- During `[depart_time, arrive_time)`: user is in transit.
- At or after arrival: user is at destination until another flight starts.

### Clarifying Questions

- Are flights for a user guaranteed non-overlapping?
- What should be returned while in the air?
- Are times comparable integers, ISO strings, or time zones?
- What if the query is before the user's first known flight?
- What if two flights share a boundary timestamp?

### Implementation Shape

- Group flights by user.
- Sort each user's flights by departure time.
- Binary search or scan for the relevant interval.
- Be precise about boundary inclusivity.

## Topic 5: Progressive OOD / ICF-Style Tasks

### What To Expect

Public sources continue to mention progressive CodeSignal-style tasks: recipe
manager, filesystem/cloud storage, banking, database, working-hours/worker
register, and similar stateful systems.

You already passed this stage, but the pattern matters because Ramp appears to
like practical domain modeling.

### What These Problems Reward

- Small explicit data models.
- Stable operation dispatcher.
- Converting string inputs to typed values early.
- Keeping invariants near the data they protect.
- Returning exactly the specified string/array shape.
- Building helper methods that make later levels easier.

### Defensive Template

```python
class System:
    def __init__(self):
        self.records = {}

    def solution(self, queries):
        out = []
        for query in queries:
            op = query[0]
            args = query[1:]
            out.append(self.dispatch(op, args))
        return out

    def dispatch(self, op, args):
        if op == "ADD":
            return self.add(*args)
        if op == "GET":
            return self.get(*args)
        raise ValueError(f"unknown op {op}")
```

### Habits To Carry Forward

- Convert once at the boundary: `amount = int(amount_str)`.
- Do not mix typed and string values internally.
- Use tiny helpers for `ok`, `not_found`, `money`, or formatting when the spec
  has strict return strings.
- Add local assertions for invariants while practicing.
- Prefer data structures that match future extension, not just level 1.

## Topic 6: Frontend / Single-Screen App Variants

### What To Expect

Frontend-specific reports mention Wordle-like or small single-screen app tasks.
These are likely role-dependent.

### What They Test

- State modeling.
- Controlled inputs.
- Game/result validation.
- Reset and edge states.
- Clean component boundaries.
- Tests that may not be perfect, so debugging matters.

### Prep Scope

For a backend SWE path, this is lower priority than URL traversal and system
design. For frontend, practice building a small interactive app quickly with
clear state transitions.

## Topic 7: Video / Behavioral Screen

### Reported Question Themes

Public replies mention short one-way video prompts around:

- How you got into programming.
- Explaining a technical CS concept to a non-technical person.
- Why Ramp and why this role.
- How you use AI day to day.
- A time you led a project end-to-end.

### Answer Shape

Use a compact structure:

1. One-sentence answer.
2. Specific example.
3. Outcome or lesson.

For Ramp specifically, emphasize:

- Practicality.
- Ownership.
- Speed with quality.
- Clear communication under ambiguity.
- Comfort with product/business context.

## Topic 8: Final Round / Cross-Functional

### What To Expect

Older visible reports describe final rounds as coding, system design,
cross-functional, and hiring-manager style conversations.

### Cross-Functional Prep

Prepare stories about:

- Working with product/design/support/sales.
- Clarifying ambiguous requirements.
- Pushing back without being difficult.
- Debugging production issues.
- Choosing a simpler design under time pressure.
- Explaining tradeoffs to non-engineers.

### Hiring Manager Prep

Have crisp answers for:

- Why Ramp.
- Why now.
- A project you owned end-to-end.
- A failure or hard debugging story.
- How you handle unclear requirements.
- How you use AI responsibly.
- What kind of engineering environment helps you do your best work.

## Prep Plan

### Day 1: URL/API Traversal

- Implement URL traversal with BFS.
- Add timeout and bounded retry.
- Add handling for `404`, `401`, `429`, and `50x`.
- Practice with mocked responses first.
- Then practice against a tiny local Flask or `http.server` endpoint.

### Day 2: Response Shape Discovery

- Practice inspecting unknown JSON and text response shapes.
- Write `extract_next_urls(data)` for dict, list, text, and nested cases.
- Practice narrating assumptions before coding.

### Day 3: System Design

- Design hotel availability for 30 minutes.
- Redesign it for calendar event CRUD for 30 minutes.
- Focus on data model, consistency, caching, and write races.

### Day 4: Spreadsheet / Timeline

- Implement spreadsheet `get`/`set` with formula dependencies.
- Implement user-location-from-flights with interval boundaries.

### Day 5: Behavioral

- Record 90-second answers to the five video prompts.
- Tighten each answer to one story and one lesson.

## Highest-Leverage Practice Prompts

1. "Given a starting URL, find the endpoint that returns `Congrats`. Responses
   may contain one URL, many URLs, or irrelevant text."
2. "Repeat prompt 1, but some URLs return `503` twice before succeeding."
3. "Repeat prompt 1, but one response returns a token that must be sent on later
   requests."
4. "Design hotel room availability for a travel site with very high read volume."
5. "Implement spreadsheet cells where `A1` can be `5` or `=B1+C1`."
6. "Given flight records and a query time, return a user's current airport or
   in-transit status."
7. "Implement a task manager with task CRUD, priority sorting, user quotas,
   assignments, completion, and overdue detection."
8. "Extract a hidden URL from a DOM-like tree using a limited wildcard selector
   language."
9. "Explain BFS to a non-technical person in 90 seconds."
10. "Tell a story about leading a project from ambiguity to shipped result."

## Sources

- Ramp interview index on 1Point3Acres:
  https://www.1point3acres.com/interview/company/ramp
- Recent URL maze / BFS phone-screen report:
  https://www.1point3acres.com/bbs/thread-1175715-1-1.html
- URL graph traversal variant report:
  https://www.1point3acres.com/bbs/thread-1169172-1-1.html
- Web crawler challenge index page:
  https://www.1point3acres.com/interview/thread/1168272
- Recursive URL fetching index page:
  https://www.1point3acres.com/interview/thread/1166160
- Hotel reservation system design index page:
  https://www.1point3acres.com/interview/thread/1173337
- Flight-data location index page:
  https://www.1point3acres.com/interview/thread/1147969
- Hireflix/video question thread:
  https://www.1point3acres.com/bbs/thread-1141269-1-1.html
- Ramp tag pages with visible snippets for older reports:
  https://www.1point3acres.com/bbs/tag/ramp-9787-1.html
  https://www.1point3acres.com/bbs/tag/ramp-9787-2.html
  https://www.1point3acres.com/bbs/tag/ramp-9787-3.html
  https://www.1point3acres.com/bbs/tag/ramp-9787-4.html
  https://www.1point3acres.com/bbs/tag/ramp-9787-5.html
  https://www.1point3acres.com/bbs/tag/ramp-9787-6.html
- Ramp engineering article mirror, Rate Limiting with Redis:
  https://www.engineering.fyi/article/rate-limiting-with-redis
- Ramp API docs, rate limits and timeouts:
  https://docs.ramp.com/developer-api/v1/rate-limiting
- PracHub Ramp Coding & Algorithms category page:
  https://prachub.com/companies/ramp/categories/coding-and-algorithms
- PracHub URL maze question:
  https://prachub.com/coding-questions/find-an-exit-in-a-url-maze
- PracHub final URL / congrats crawler question:
  https://prachub.com/coding-questions/find-final-url-by-crawling-until-congrats
- PracHub BFS API exit question:
  https://prachub.com/coding-questions/find-exit-url-via-bfs-api-calls
- PracHub simple HTTP maze navigation question:
  https://prachub.com/coding-questions/navigate-maze-via-http-api
- PracHub flight-history tracking question:
  https://prachub.com/coding-questions/track-users-from-flight-history
- PracHub digital recipe manager question:
  https://prachub.com/coding-questions/implement-a-multi-level-digital-recipe-manager
- PracHub task manager APIs question:
  https://prachub.com/coding-questions/implement-multi-level-task-manager-apis
- PracHub Wordle-style React question:
  https://prachub.com/coding-questions/build-a-wordle-style-game-in-react
- PracHub Ramp-labeled recurring ledger question:
  https://prachub.com/coding-questions/detect-recurring-transactions-from-a-ledger

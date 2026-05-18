import { setProblem } from "./_shared";

const minRooms = setProblem({
  id: "tek-min-meeting-rooms",
  title: "Minimum Meeting Rooms",
  difficulty: "medium",
  patterns: ["sweep line", "interval scheduling", "sorting"],
  entrypoint: "min_meeting_rooms",
  prompt:
    "You are given a list of meetings, each represented as `[start, end]` with `start < end` and end exclusive (a meeting ending at 10 frees the room for a meeting starting at exactly 10). Return the minimum number of meeting rooms needed so that no two meetings sharing a room overlap. Input meetings are in no particular order.",
  constraints: [
    "0 <= len(meetings) <= 50000.",
    "Each meeting is a list `[start, end]` of integers with start < end.",
    "A meeting ending at time t does not conflict with one starting at time t.",
    "Return 0 for an empty input.",
    "Do not assume the input is sorted."
  ],
  examples: [
    { name: "three overlapping", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
    { name: "back to back", args: [[[0, 10], [10, 20]]], expected: 1 }
  ],
  starterCode:
    "def min_meeting_rooms(meetings):\n" +
    "    # Return the minimum number of rooms needed to host every meeting.\n" +
    "    pass\n",
  referenceCode:
    "def min_meeting_rooms(meetings):\n" +
    "    events = []\n" +
    "    for start, end in meetings:\n" +
    "        events.append((start, 1))\n" +
    "        events.append((end, -1))\n" +
    "    events.sort(key=lambda event: (event[0], event[1]))\n" +
    "    active = 0\n" +
    "    peak = 0\n" +
    "    for _, delta in events:\n" +
    "        active += delta\n" +
    "        if active > peak:\n" +
    "            peak = active\n" +
    "    return peak\n",
  solutionCode:
    "def min_meeting_rooms(meetings):\n" +
    "    events = []\n" +
    "    for start, end in meetings:\n" +
    "        events.append((start, 1))\n" +
    "        events.append((end, -1))\n" +
    "    events.sort(key=lambda event: (event[0], event[1]))\n" +
    "    active = peak = 0\n" +
    "    for _, delta in events:\n" +
    "        active += delta\n" +
    "        peak = max(peak, active)\n" +
    "    return peak\n",
  visibleTests: [
    { name: "empty", args: [[]], expected: 0 },
    { name: "single meeting", args: [[[0, 30]]], expected: 1 },
    { name: "three overlapping", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
    { name: "back to back same room", args: [[[0, 10], [10, 20]]], expected: 1 }
  ],
  hiddenTests: [
    { name: "fully nested", args: [[[1, 10], [2, 9], [3, 8]]], expected: 3 },
    { name: "disjoint", args: [[[0, 1], [2, 3], [4, 5]]], expected: 1 },
    { name: "unsorted input", args: [[[10, 20], [0, 30], [5, 15]]], expected: 3 },
    { name: "shared endpoints chain", args: [[[1, 5], [5, 10], [10, 15], [1, 12]]], expected: 2 },
    { name: "five simultaneous starts", args: [[[0, 30], [0, 20], [0, 10], [0, 5], [0, 1]]], expected: 5 },
    { name: "non-zero offsets disjoint", args: [[[5, 10], [10, 15], [15, 20]]], expected: 1 },
    { name: "peak in the middle", args: [[[0, 100], [10, 20], [10, 20], [10, 20], [90, 95]]], expected: 4 },
    { name: "tight chain of end-equals-start", args: [[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]], expected: 1 },
    { name: "two pairs of identical intervals", args: [[[0, 10], [0, 10], [5, 15], [5, 15]]], expected: 4 }
  ],
  hints: [
    "Turn each meeting into a start event (+1) and an end event (-1).",
    "When two events share a time, process the end before the start so the room can be reused.",
    "Sweep the events in time order and track the running count of active meetings; the answer is the peak count."
  ],
  solution:
    "Convert each meeting into two events: a +1 at the start time and a -1 at the end time. Sort events by (time, delta) so that for equal times an ending meeting is processed before a starting one — this is what allows back-to-back meetings to share a room. Sweep the events, keep a running active count, and remember the maximum value the count ever reaches. That maximum is the minimum number of concurrent rooms needed.",
  walkthrough:
    "The sweep is a classic transform: any interval question that asks for the maximum overlap can be answered by sorting endpoints and walking them in order. The (-1 before +1) tie-breaker encodes the inclusive-start, exclusive-end semantics. The algorithm is O(n log n) from the sort and O(1) extra space beyond the events array.",
  followUps: [
    "How would you also return one valid room assignment per meeting?",
    "How would you handle 1M meetings without building the full events array?",
    "What if a room transition required a 5-minute cleanup buffer?"
  ],
  complexity: { time: "O(n log n)", space: "O(n)" }
});

export const intervalsProblems = [minRooms];

import type { BonusSeed } from "./types";

/**
 * Greedy bonus problems. Concepts: intervals, sorting, reachability, exchange
 * arguments, partitioning. Each seed drills a greedy choice that is provably
 * correct, not merely plausible — distinct from the guided set and from each
 * other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "greedy-bonus-01",
    chapterId: "greedy",
    title: "Fewest Coins For An Amount",
    difficulty: "warmup",
    patterns: ["greedy", "sorting", "exchange argument"],
    entrypoint: "fewest_coins",
    signature: "coins, amount",
    prompt:
      "You have an unlimited supply of each coin denomination in `coins`, drawn from a canonical system where every larger coin is a whole-number multiple of the next smaller one (for example 1, 5, 10, 25). Return the fewest coins whose values sum exactly to `amount`. Return 0 when the amount is 0.",
    constraints: [
      "The amount is a non-negative integer and `coins` always contains a 1.",
      "Denominations form a canonical system, so taking the largest usable coin is always safe.",
      "Each denomination may be used any number of times."
    ],
    hints: [
      "Sort the denominations from largest to smallest before you start.",
      "At each step take as many of the current largest coin as fit, then move on."
    ],
    solution:
      "Sort the coins from large to small. Walk the denominations, using integer division to take the maximum count of the current coin that fits in the remaining amount, and subtract their value. The total count is the answer.",
    walkthrough:
      "In a canonical system a larger coin can never be beaten by an equivalent run of smaller coins, so spending the biggest coin that still fits is never wrong. Integer division grabs the whole greedy batch at once, so the loop touches each denomination exactly once.",
    followUps: [
      "Why can this greedy choice fail for a non-canonical set such as 1, 3, 4 making 6?",
      "How would you also return how many of each denomination were used?"
    ],
    code: `def fewest_coins(coins, amount):
    count = 0
    for coin in sorted(coins, reverse=True):
        count += amount // coin
        amount %= coin
    return count
`,
    visibleTests: [
      { name: "standard change", args: [[1, 5, 10, 25], 63], expected: 6 },
      { name: "exact single coin", args: [[1, 5, 10, 25], 25], expected: 1 }
    ],
    hiddenTests: [
      { name: "zero amount", args: [[1, 5, 10, 25], 0], expected: 0 },
      { name: "only pennies needed", args: [[1, 5, 10, 25], 4], expected: 4 },
      { name: "powers of two", args: [[1, 2, 4, 8], 15], expected: 4 },
      { name: "single denomination", args: [[1], 7], expected: 7 },
      { name: "unsorted input", args: [[10, 1, 25, 5], 99], expected: 9 }
    ],
    time: "O(k log k)",
    space: "O(1)"
  },
  {
    id: "greedy-bonus-02",
    chapterId: "greedy",
    title: "Maximum Value On The Truck",
    difficulty: "easy",
    patterns: ["greedy", "sorting", "knapsack"],
    entrypoint: "max_truck_value",
    signature: "boxes, capacity",
    prompt:
      "Each box is a pair `[units, value_per_unit]`: a stack of identical units, each worth the given value. A truck holds at most `capacity` units total. You may take any number of units from a box — none, some, or all of them. Return the greatest total value the truck can carry.",
    constraints: [
      "The capacity is a non-negative integer; box unit counts are non-negative.",
      "A box may be loaded partially — take any number of its units from 0 up to its size.",
      "Value per unit may differ between boxes and is non-negative."
    ],
    hints: [
      "Sort the boxes so the most valuable units are considered first.",
      "Take as many units as fit from the current box, then reduce the remaining capacity."
    ],
    solution:
      "Sort the boxes by value per unit in descending order. Walk them, loading min(remaining capacity, box size) units from each and adding that many times the unit value. Stop once the capacity is full.",
    walkthrough:
      "Because units are interchangeable and boxes split freely, every unit of capacity should hold the most valuable unit still available. Sorting by unit value and filling greedily guarantees that. The fractional box at the boundary is handled by the min, so no backtracking is needed.",
    followUps: [
      "Why would this greedy approach be wrong if boxes could not be split?",
      "How would you break ties between boxes with equal value per unit?"
    ],
    code: `def max_truck_value(boxes, capacity):
    total = 0
    for units, unit_value in sorted(boxes, key=lambda box: box[1], reverse=True):
        if capacity == 0:
            break
        take = min(capacity, units)
        total += take * unit_value
        capacity -= take
    return total
`,
    visibleTests: [
      { name: "partial top box", args: [[[3, 8], [5, 4], [2, 5]], 6], expected: 38 },
      { name: "capacity covers all", args: [[[1, 2], [2, 3]], 10], expected: 8 }
    ],
    hiddenTests: [
      { name: "zero capacity", args: [[[4, 9]], 0], expected: 0 },
      { name: "no boxes", args: [[], 5], expected: 0 },
      { name: "single box partial", args: [[[10, 7]], 3], expected: 21 },
      { name: "tie on unit value", args: [[[2, 5], [2, 5]], 3], expected: 15 },
      { name: "zero value box ignored first", args: [[[5, 0], [2, 6]], 4], expected: 12 }
    ],
    time: "O(n log n)",
    space: "O(1)"
  },
  {
    id: "greedy-bonus-03",
    chapterId: "greedy",
    title: "Lemonade Stand Change",
    difficulty: "easy",
    patterns: ["greedy", "running state", "simulation"],
    entrypoint: "can_make_change",
    signature: "bills",
    prompt:
      "Each lemonade costs exactly 5. Customers pay in order with a 5, 10, or 20 bill, listed in `bills`. You start with no money and must give correct change from bills you have already collected. Return True if you can serve every customer, otherwise False.",
    constraints: [
      "Every bill is one of 5, 10, or 20.",
      "Change must be assembled from bills already received from earlier customers.",
      "An empty list serves nobody, which trivially succeeds — return True."
    ],
    hints: [
      "Only the counts of 5 and 10 bills matter; a 20 is never used as change.",
      "When change for a 20 is needed, prefer to hand back a 10 plus a 5 over three 5s."
    ],
    solution:
      "Track how many 5 and 10 bills are on hand. A 5 needs no change. A 10 needs one 5. A 20 needs a 10 and a 5, or failing that three 5s. Return False the moment change cannot be made.",
    walkthrough:
      "A 5 bill is the only flexible change, so it must be conserved. When breaking a 20, spending a 10 first keeps more 5s for future 10 bills, which can only be paid with a 5. That exchange argument makes the ten-plus-five choice strictly safe whenever it is available.",
    followUps: [
      "Why is greedily spending the 10 first never worse than spending three 5s?",
      "How would the logic change if lemonade cost 10 instead of 5?"
    ],
    code: `def can_make_change(bills):
    fives = 0
    tens = 0
    for bill in bills:
        if bill == 5:
            fives += 1
        elif bill == 10:
            if fives == 0:
                return False
            fives -= 1
            tens += 1
        else:
            if tens > 0 and fives > 0:
                tens -= 1
                fives -= 1
            elif fives >= 3:
                fives -= 3
            else:
                return False
    return True
`,
    visibleTests: [
      { name: "serves everyone", args: [[5, 5, 5, 10, 20]], expected: true },
      { name: "no change for ten", args: [[10, 10]], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: true },
      { name: "single five", args: [[5]], expected: true },
      { name: "twenty first fails", args: [[20]], expected: false },
      { name: "three fives break twenty", args: [[5, 5, 5, 20]], expected: true },
      { name: "ten preferred keeps fives", args: [[5, 5, 5, 10, 20, 5, 10]], expected: true }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "greedy-bonus-04",
    chapterId: "greedy",
    title: "Plant Flowers Without Crowding",
    difficulty: "warmup",
    patterns: ["greedy", "partitioning", "scanning"],
    entrypoint: "can_plant_flowers",
    signature: "bed, k",
    prompt:
      "A flower bed is a list of 0s and 1s, where 1 marks an occupied plot. No two flowers may sit in adjacent plots. Return True if `k` new flowers can be planted into the empty plots without ever placing two flowers side by side, otherwise False.",
    constraints: [
      "The bed contains only 0 and 1, and no two existing 1s are already adjacent.",
      "k is a non-negative integer.",
      "Planting k = 0 flowers always succeeds."
    ],
    hints: [
      "Scan left to right and plant in the first empty plot whose neighbours are both empty.",
      "Planting as early as possible never blocks a slot a later choice would need."
    ],
    solution:
      "Scan the bed once. Plant a flower in any plot that is empty and whose left and right neighbours (treating off-bed as empty) are also empty, marking it occupied as you go. Count the plantings and compare with k.",
    walkthrough:
      "Greedily filling the earliest legal plot is safe: a flower placed earlier can only free up, never remove, room further right. Mutating the bed as you plant keeps the adjacency check correct for the very next plot.",
    followUps: [
      "Why does planting in the leftmost legal plot never reduce the total that fits?",
      "How would you instead return the maximum number of flowers the bed can hold?"
    ],
    code: `def can_plant_flowers(bed, k):
    plots = list(bed)
    planted = 0
    for i in range(len(plots)):
        if plots[i] == 0:
            left_empty = i == 0 or plots[i - 1] == 0
            right_empty = i == len(plots) - 1 or plots[i + 1] == 0
            if left_empty and right_empty:
                plots[i] = 1
                planted += 1
    return planted >= k
`,
    visibleTests: [
      { name: "fits two", args: [[1, 0, 0, 0, 1], 1], expected: true },
      { name: "too many requested", args: [[1, 0, 0, 0, 1], 2], expected: false }
    ],
    hiddenTests: [
      { name: "empty bed zero flowers", args: [[], 0], expected: true },
      { name: "empty bed one flower", args: [[], 1], expected: false },
      { name: "all empty long bed", args: [[0, 0, 0, 0, 0], 3], expected: true },
      { name: "all occupied", args: [[1, 0, 1], 1], expected: false },
      { name: "single empty plot", args: [[0], 1], expected: true }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "greedy-bonus-05",
    chapterId: "greedy",
    title: "Fewest Arrows To Pop Balloons",
    difficulty: "medium",
    patterns: ["greedy", "intervals", "sorting"],
    entrypoint: "min_arrows",
    signature: "balloons",
    prompt:
      "Each balloon is an interval `[start, end]` floating along a wall. An arrow shot straight up at position x pops every balloon whose interval contains x (inclusive at both ends). Return the minimum number of arrows needed to pop every balloon.",
    constraints: [
      "Each balloon satisfies start <= end; coordinates may be negative.",
      "An arrow at x pops a balloon when start <= x <= end.",
      "An empty list of balloons needs zero arrows."
    ],
    hints: [
      "Sort the balloons by their end coordinate.",
      "Fire an arrow at the end of the earliest-ending balloon, then skip every balloon that arrow already pops."
    ],
    solution:
      "Sort balloons by end coordinate. Shoot the first arrow at the smallest end. Skip every later balloon whose start is at or before that arrow. When a balloon starts past the arrow, shoot a new arrow at its end and repeat.",
    walkthrough:
      "Placing each arrow at the earliest end is optimal: that arrow pops the tightest balloon and, by being as far left as it can usefully go, also catches the most other balloons. Any balloon it misses starts strictly later, so it genuinely requires a fresh arrow.",
    followUps: [
      "Why is sorting by end coordinate better here than sorting by start?",
      "How would you also report the x position of each arrow?"
    ],
    code: `def min_arrows(balloons):
    if not balloons:
        return 0
    ordered = sorted(balloons, key=lambda b: b[1])
    arrows = 1
    shot = ordered[0][1]
    for start, end in ordered[1:]:
        if start > shot:
            arrows += 1
            shot = end
    return arrows
`,
    visibleTests: [
      { name: "two clusters", args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
      { name: "all disjoint", args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single balloon", args: [[[4, 9]]], expected: 1 },
      { name: "all share a point", args: [[[1, 5], [2, 6], [3, 4]]], expected: 1 },
      { name: "touching ends count", args: [[[1, 2], [2, 3], [3, 4]]], expected: 2 },
      { name: "negative coordinates", args: [[[-7, -3], [-5, -1], [0, 4]]], expected: 2 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "greedy-bonus-06",
    chapterId: "greedy",
    title: "Complete The Fuel Circuit",
    difficulty: "medium",
    patterns: ["greedy", "reachability", "running state"],
    entrypoint: "start_station",
    signature: "fuel, cost",
    prompt:
      "Stations sit on a circular route. Station i offers `fuel[i]` litres, and driving from station i to the next station burns `cost[i]` litres. A car with an empty tank must complete one full loop. Return the index of a station it can start from to finish the loop, or -1 if no such station exists.",
    constraints: [
      "The lists `fuel` and `cost` have the same length and may be empty.",
      "Values are non-negative integers.",
      "If a valid start exists it is unique; return -1 when none works."
    ],
    hints: [
      "If the total fuel is less than the total cost, no start can possibly work.",
      "Track the running tank; whenever it goes negative, no station up to here can be the start."
    ],
    solution:
      "First compare total fuel with total cost — a deficit means -1. Otherwise scan once with a running tank balance. Each time the tank drops below zero, discard every station so far and tentatively start at the next one. The final candidate is the answer.",
    walkthrough:
      "If the tank empties partway from a candidate start, no station between that start and the failure point can succeed either, because each of them would have begun the same stretch with even less fuel. So the search jumps straight past them. When the totals are non-negative, exactly one surviving candidate completes the loop.",
    followUps: [
      "Why does a non-negative fuel-minus-cost total guarantee the surviving candidate works?",
      "How would you adapt this if you only needed to know whether any start exists?"
    ],
    code: `def start_station(fuel, cost):
    if sum(fuel) < sum(cost):
        return -1
    start = 0
    tank = 0
    for i in range(len(fuel)):
        tank += fuel[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start
`,
    visibleTests: [
      { name: "start at index three", args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { name: "impossible loop", args: [[2, 3, 4], [3, 4, 3]], expected: -1 }
    ],
    hiddenTests: [
      { name: "empty route", args: [[], []], expected: 0 },
      { name: "single station enough", args: [[5], [3]], expected: 0 },
      { name: "single station short", args: [[2], [5]], expected: -1 },
      { name: "start at zero", args: [[3, 1, 1], [1, 2, 2]], expected: 0 },
      { name: "exact balance wraps", args: [[4, 0, 0], [0, 2, 2]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "greedy-bonus-07",
    chapterId: "greedy",
    title: "Rooms For Overlapping Meetings",
    difficulty: "easy",
    patterns: ["greedy", "intervals", "sorting"],
    entrypoint: "min_rooms",
    signature: "meetings",
    prompt:
      "Each meeting is a pair `[start, end]` with start < end. Two meetings need separate rooms only if their times truly overlap; a meeting ending exactly when another starts may reuse the room. Return the minimum number of rooms that holds every meeting.",
    constraints: [
      "Each meeting satisfies start < end; times are non-negative integers.",
      "A meeting ending at time t and another starting at time t do not overlap.",
      "An empty schedule needs zero rooms."
    ],
    hints: [
      "Pull all start times and all end times into two separate sorted lists.",
      "Sweep through events in time order; a start claims a room, an end frees one."
    ],
    solution:
      "Sort the start times and the end times separately. Sweep with two pointers: when the next start is before the next end, a meeting begins so increment the room count; otherwise a meeting ends so advance the end pointer. The peak room count is the answer.",
    walkthrough:
      "The number of rooms needed at any instant is the number of meetings active then, which peaks at some start event. Merging the two sorted streams lets a start that beats the earliest free time reuse no room, while a start that does not means a room just opened up — so the running count tracks the true maximum overlap.",
    followUps: [
      "Why is the answer exactly the largest number of meetings overlapping at one instant?",
      "How would a min-heap of end times solve the same problem?"
    ],
    code: `def min_rooms(meetings):
    starts = sorted(m[0] for m in meetings)
    ends = sorted(m[1] for m in meetings)
    rooms = 0
    best = 0
    end_index = 0
    for start in starts:
        if start < ends[end_index]:
            rooms += 1
            best = max(best, rooms)
        else:
            end_index += 1
    return best
`,
    visibleTests: [
      { name: "double booked", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { name: "back to back", args: [[[7, 10], [2, 4]]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single meeting", args: [[[1, 9]]], expected: 1 },
      { name: "touching reuses room", args: [[[1, 5], [5, 9], [9, 12]]], expected: 1 },
      { name: "triple overlap", args: [[[1, 10], [2, 7], [3, 19]]], expected: 3 },
      { name: "all identical", args: [[[4, 8], [4, 8], [4, 8]]], expected: 3 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "greedy-bonus-08",
    chapterId: "greedy",
    title: "Largest Sum After K Sign Flips",
    difficulty: "easy",
    patterns: ["greedy", "heap", "exchange argument"],
    entrypoint: "max_sum_after_flips",
    signature: "nums, k",
    prompt:
      "You must perform exactly `k` operations on the list. Each operation negates one element (its sign flips); the same element may be chosen more than once. Return the largest sum reachable after exactly k operations — note that because every operation must be used, extra flips can be forced to lower the sum.",
    constraints: [
      "k is a non-negative integer and the list has at least one element.",
      "An element may be negated repeatedly across separate operations.",
      "Exactly k operations must be used — they cannot be skipped."
    ],
    hints: [
      "Spend flips on the current smallest value, since turning a negative positive helps most.",
      "Once nothing negative remains, any leftover flips should all land on the smallest value."
    ],
    solution:
      "Build a min-heap of the values. Repeat k times: pop the smallest and push back its negation. Because the negated value re-enters the heap, leftover flips after all negatives are gone keep toggling the single smallest magnitude. Sum the heap at the end.",
    walkthrough:
      "Each flip should target the smallest value: flipping the most negative number yields the biggest gain. The heap always surfaces that value, and re-inserting the flipped result means surplus flips alternate on one element. An even surplus is harmless; an odd surplus costs only twice the smallest magnitude, which is unavoidable.",
    followUps: [
      "Why is repeatedly flipping the smallest magnitude optimal once no negatives remain?",
      "How would sorting once instead of using a heap achieve the same result?"
    ],
    code: `def max_sum_after_flips(nums, k):
    heap = list(nums)
    heapq.heapify(heap)
    for _ in range(k):
        smallest = heapq.heappop(heap)
        heapq.heappush(heap, -smallest)
    return sum(heap)
`,
    visibleTests: [
      { name: "flip the negatives", args: [[4, -1, -2, 3], 2], expected: 10 },
      { name: "leftover flips toggle", args: [[2, 5, 7], 3], expected: 10 }
    ],
    hiddenTests: [
      { name: "zero operations", args: [[3, -5, 1], 0], expected: -1 },
      { name: "single element odd flips", args: [[6], 3], expected: -6 },
      { name: "single element even flips", args: [[6], 4], expected: 6 },
      { name: "all negative fully flipped", args: [[-3, -2, -4], 3], expected: 9 },
      { name: "zero present absorbs flips", args: [[-1, 0, 2], 5], expected: 3 }
    ],
    time: "O((n + k) log n)",
    space: "O(n)"
  },
  {
    id: "greedy-bonus-09",
    chapterId: "greedy",
    title: "Pair Riders Into Boats",
    difficulty: "easy",
    patterns: ["greedy", "two pointers", "sorting"],
    entrypoint: "count_boats",
    signature: "weights, limit",
    prompt:
      "Each boat carries at most two riders and a combined weight of at most `limit`. Given each rider's weight in `weights`, return the fewest boats that carry everyone. Every individual weight is at most `limit`, so each rider can always be seated.",
    constraints: [
      "Every weight is positive and does not exceed `limit`.",
      "A boat seats at most two riders.",
      "An empty list of riders needs zero boats."
    ],
    hints: [
      "Sort the weights, then look at the lightest and heaviest remaining riders together.",
      "If the lightest and heaviest fit in one boat, pair them; otherwise the heaviest rides alone."
    ],
    solution:
      "Sort the weights and use two pointers, one at the lightest rider and one at the heaviest. If the pair fits within the limit, send both and move both pointers inward; otherwise send the heaviest alone and move only that pointer. Count the boats launched.",
    walkthrough:
      "The heaviest rider must board some boat. Giving that rider the lightest available companion is never worse: if even the lightest will not fit, no one fits, and if someone heavier could fit, the lightest fits too — so pairing with the lightest wastes nothing and frees heavier riders for each other.",
    followUps: [
      "Why is pairing the heaviest rider with the lightest never worse than any other partner?",
      "How would the approach change if a boat could seat three riders?"
    ],
    code: `def count_boats(weights, limit):
    ordered = sorted(weights)
    lo = 0
    hi = len(ordered) - 1
    boats = 0
    while lo <= hi:
        if ordered[lo] + ordered[hi] <= limit:
            lo += 1
        hi -= 1
        boats += 1
    return boats
`,
    visibleTests: [
      { name: "two perfect pairs", args: [[3, 2, 2, 1], 3], expected: 3 },
      { name: "nobody pairs", args: [[3, 5, 3, 4], 5], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 5], expected: 0 },
      { name: "single rider", args: [[4], 5], expected: 1 },
      { name: "everyone pairs", args: [[1, 2, 2, 3], 4], expected: 2 },
      { name: "all at the limit", args: [[5, 5, 5], 5], expected: 3 },
      { name: "odd count one pairs", args: [[1, 4, 2, 3, 5], 6], expected: 3 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "greedy-bonus-10",
    chapterId: "greedy",
    title: "Largest Number From Pieces",
    difficulty: "medium",
    patterns: ["greedy", "sorting", "exchange argument"],
    entrypoint: "largest_concatenation",
    signature: "nums",
    prompt:
      "Given a list of non-negative integers, arrange them in some order and concatenate their decimal digits into one number. Return that number as a string when the arrangement is chosen to make the value as large as possible.",
    constraints: [
      "Every integer is non-negative; the list may be empty, giving the result \"0\".",
      "Return the answer as a string to preserve any leading structure.",
      "If every integer is 0 the result is the single character \"0\", not \"000\"."
    ],
    hints: [
      "Sorting numerically is wrong: 3 should come before 30, but 30 before 34.",
      "Compare two pieces a and b by which of the strings a+b and b+a reads larger."
    ],
    solution:
      "Convert each integer to a string and sort with a comparator that places a before b when the concatenation a+b is lexicographically greater than b+a. Join the sorted pieces; if the result begins with 0, collapse it to a single \"0\".",
    walkthrough:
      "The pairwise rule — order a and b by comparing a+b against b+a — is a consistent total order, so sorting by it yields the global maximum. The leading-zero guard handles the all-zeros case, where every concatenation is zeros and the answer should read as one digit.",
    followUps: [
      "Why does the pairwise a+b versus b+a comparison produce a consistent ordering?",
      "How would you return the smallest concatenation instead?"
    ],
    code: `def largest_concatenation(nums):
    pieces = [str(n) for n in nums]
    pieces.sort(key=functools.cmp_to_key(
        lambda a, b: -1 if a + b > b + a else (1 if a + b < b + a else 0)
    ))
    result = "".join(pieces)
    return "0" if not result or result[0] == "0" else result
`,
    visibleTests: [
      { name: "mixed lengths", args: [[3, 30, 34, 5, 9]], expected: "9534330" },
      { name: "two pieces", args: [[10, 2]], expected: "210" }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: "0" },
      { name: "single number", args: [[42]], expected: "42" },
      { name: "all zeros collapse", args: [[0, 0, 0]], expected: "0" },
      { name: "prefix tie break", args: [[12, 121]], expected: "12121" },
      { name: "already descending", args: [[9, 8, 7]], expected: "987" }
    ],
    time: "O(n log n)",
    space: "O(n)"
  }
];

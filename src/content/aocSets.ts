import type { Problem, ProblemPart, ProblemSet } from "../types";

type AocProblemSpec = {
  id: string;
  setId: string;
  title: string;
  difficulty: Problem["difficulty"];
  patterns: string[];
  prompt: string;
  constraints: string[];
  examples: Problem["examples"];
  entrypoint: string;
  starterCode: string;
  referenceCode: string;
  solutionCode: string;
  visibleTests: Problem["visibleTests"];
  hiddenTests: Problem["hiddenTests"];
  hints: string[];
  solution: string;
  walkthrough: string;
  complexity: Problem["complexity"];
  part2: ProblemPart;
};

function aocProblem(spec: AocProblemSpec): Problem {
  return {
    id: spec.id,
    chapterId: spec.setId,
    title: spec.title,
    difficulty: spec.difficulty,
    source: "guided",
    patterns: spec.patterns,
    prompt: spec.prompt,
    constraints: spec.constraints,
    examples: spec.examples,
    starterCode: spec.starterCode,
    referenceCode: spec.referenceCode,
    solutionCode: spec.solutionCode,
    entrypoint: spec.entrypoint,
    adapter: "default",
    visibleTests: spec.visibleTests,
    hiddenTests: spec.hiddenTests,
    hints: spec.hints,
    solution: spec.solution,
    walkthrough: spec.walkthrough,
    complexity: spec.complexity,
    parts: [spec.part2]
  };
}

// ============================================================================
// YEAR 1 — Field Survey (an expedition mapping an unknown valley)
// ============================================================================

const Y1_SET_ID = "aoc-year-1";

const y1d1 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d1-elevation-pairs",
  title: "Day 1: Elevation Pairs",
  difficulty: "warmup",
  patterns: ["parsing", "hash set", "pair sum"],
  prompt:
    "You receive a survey log as a single multi-line string. The first non-empty line is an integer `target`. Every following non-empty line is one integer elevation reading. Count the number of unordered pairs `(i, j)` with `i < j` such that `readings[i] + readings[j] == target`. Return the count.",
  constraints: [
    "Input lines are separated by `\\n`. Blank lines should be skipped.",
    "All values are valid integers (positive, negative, or zero).",
    "Pairs are unordered: each `{i, j}` pair counts once.",
    "Two readings with the same value at different indexes form a valid pair.",
    "Return 0 if fewer than two readings are present."
  ],
  examples: [
    { name: "small set", args: ["10\n3\n7\n5\n5\n2"], expected: 2 }
  ],
  entrypoint: "elevation_pairs",
  starterCode:
    "def elevation_pairs(input_text):\n" +
    "    # First non-empty line is the target. Remaining lines are integers.\n" +
    "    # Return the count of unordered pairs that sum to target.\n" +
    "    pass\n",
  referenceCode:
    "def elevation_pairs(input_text):\n" +
    "    lines = [line for line in input_text.split(\"\\n\") if line.strip()]\n" +
    "    if not lines:\n" +
    "        return 0\n" +
    "    target = int(lines[0])\n" +
    "    values = [int(line) for line in lines[1:]]\n" +
    "    counts = {}\n" +
    "    pairs = 0\n" +
    "    for value in values:\n" +
    "        pairs += counts.get(target - value, 0)\n" +
    "        counts[value] = counts.get(value, 0) + 1\n" +
    "    return pairs\n",
  solutionCode:
    "def elevation_pairs(input_text):\n" +
    "    parts = [p for p in input_text.split(\"\\n\") if p.strip()]\n" +
    "    if not parts:\n" +
    "        return 0\n" +
    "    target = int(parts[0])\n" +
    "    seen = {}\n" +
    "    total = 0\n" +
    "    for raw in parts[1:]:\n" +
    "        value = int(raw)\n" +
    "        total += seen.get(target - value, 0)\n" +
    "        seen[value] = seen.get(value, 0) + 1\n" +
    "    return total\n",
  visibleTests: [
    { name: "two pairs sum to 10", args: ["10\n3\n7\n5\n5\n2"], expected: 2 },
    { name: "no pairs", args: ["100\n1\n2\n3"], expected: 0 },
    { name: "empty input", args: [""], expected: 0 },
    { name: "negative values", args: ["0\n-3\n3\n-5\n5"], expected: 2 }
  ],
  hiddenTests: [
    { name: "duplicates count distinctly", args: ["6\n3\n3\n3"], expected: 3 },
    { name: "single reading", args: ["10\n5"], expected: 0 },
    { name: "target zero", args: ["0\n0\n0\n0"], expected: 3 },
    { name: "mixed with blanks", args: ["8\n1\n\n7\n\n3\n5"], expected: 2 },
    { name: "target unreachable", args: ["1000\n1\n2\n3\n4"], expected: 0 },
    { name: "four zeros target zero", args: ["0\n0\n0\n0\n0"], expected: 6 },
    { name: "pair value matches half target", args: ["10\n5\n5\n5\n5"], expected: 6 },
    { name: "all negatives sum to negative target", args: ["-7\n-3\n-4\n-2\n-5"], expected: 2 },
    { name: "value pairs with target-itself only when duplicated", args: ["6\n3"], expected: 0 }
  ],
  hints: [
    "Walk the values once and ask: how many prior values would pair with this one to make target?",
    "A frequency dict keyed by value answers that question in O(1) per element.",
    "Update the dict only after counting, so a value never pairs with itself unless it appears twice."
  ],
  solution:
    "Parse the first non-empty line as target and the rest as integers. Walk the values once, maintaining a dict of how many times each value has been seen. For each new value `v`, increment `pairs` by the count of `target - v` seen so far, then increment the count of `v`. This guarantees each unordered pair is counted exactly once.",
  walkthrough:
    "The hash-table-frequency trick replaces an O(n²) double loop with a single pass. Updating the dict after the lookup is the load-bearing detail — it preserves the `i < j` ordering implicit in the pair definition.",
  complexity: { time: "O(n)", space: "O(n)" },
  part2: {
    id: "part-2-triples",
    title: "Part 2: Triple sums",
    prompt:
      "Same input format. Now count unordered triples `(i, j, k)` with `i < j < k` such that `readings[i] + readings[j] + readings[k] == target`. Return the count.",
    entrypoint: "elevation_triples",
    starterCode:
      "def elevation_triples(input_text):\n" +
      "    # Count unordered triples that sum to target.\n" +
      "    pass\n",
    referenceCode:
      "def elevation_triples(input_text):\n" +
      "    lines = [line for line in input_text.split(\"\\n\") if line.strip()]\n" +
      "    if not lines:\n" +
      "        return 0\n" +
      "    target = int(lines[0])\n" +
      "    values = [int(line) for line in lines[1:]]\n" +
      "    n = len(values)\n" +
      "    total = 0\n" +
      "    for i in range(n):\n" +
      "        seen = {}\n" +
      "        for j in range(i + 1, n):\n" +
      "            need = target - values[i] - values[j]\n" +
      "            total += seen.get(need, 0)\n" +
      "            seen[values[j]] = seen.get(values[j], 0) + 1\n" +
      "    return total\n",
    solutionCode:
      "def elevation_triples(input_text):\n" +
      "    parts = [p for p in input_text.split(\"\\n\") if p.strip()]\n" +
      "    if not parts:\n" +
      "        return 0\n" +
      "    target = int(parts[0])\n" +
      "    nums = [int(x) for x in parts[1:]]\n" +
      "    n = len(nums)\n" +
      "    triples = 0\n" +
      "    for i in range(n):\n" +
      "        seen = {}\n" +
      "        for j in range(i + 1, n):\n" +
      "            need = target - nums[i] - nums[j]\n" +
      "            triples += seen.get(need, 0)\n" +
      "            seen[nums[j]] = seen.get(nums[j], 0) + 1\n" +
      "    return triples\n",
    visibleTests: [
      { name: "one triple", args: ["15\n2\n4\n3\n8\n5"], expected: 2 },
      { name: "no triples", args: ["100\n1\n2\n3\n4"], expected: 0 },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      { name: "zero target zero values", args: ["0\n0\n0\n0\n0"], expected: 4 },
      { name: "negative mix", args: ["0\n-2\n-1\n1\n2\n3"], expected: 1 },
      { name: "all same", args: ["9\n3\n3\n3\n3"], expected: 4 },
      { name: "five zeros target zero", args: ["0\n0\n0\n0\n0\n0"], expected: 10 },
      { name: "target unreachable for triples", args: ["1000\n1\n2\n3\n4\n5"], expected: 0 },
      { name: "two readings cannot triple", args: ["6\n2\n2"], expected: 0 },
      { name: "single reading cannot triple", args: ["6\n2"], expected: 0 }
    ],
    hints: [
      "Fix the smallest index `i`, then count pairs (j, k) with j > i that sum to target - values[i].",
      "Reuse the Part 1 pair-counting strategy inside the inner loop with a fresh frequency dict.",
      "Reset the inner dict on every new outer index so prior `i` values do not bleed in."
    ],
    solution:
      "For each outer index `i`, run the Part 1 pair-sum algorithm over the suffix `i+1..n-1` looking for `target - values[i]`. The inner pass uses a fresh frequency dict so each ordered (i, j, k) is counted exactly once. Time is O(n²).",
    walkthrough:
      "The outer loop fixes the smallest of the three indexes; the inner loop reduces to the Part 1 subproblem. Sorting + two pointers would also work, but the hash approach keeps the code shape identical to Part 1 — a clean structural win in an interview.",
    complexity: { time: "O(n^2)", space: "O(n)" }
  }
});

const y1d2 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d2-patrol-tags",
  title: "Day 2: Patrol Tags",
  difficulty: "easy",
  patterns: ["parsing", "validation", "counting"],
  prompt:
    "Each non-empty line of the input has the shape `MIN-MAX CHAR: WORD` (for example `1-3 a: abcde`). The line is valid when the count of `CHAR` in `WORD` is at least `MIN` and at most `MAX`. Return the number of valid lines.",
  constraints: [
    "MIN and MAX are non-negative integers with MIN <= MAX.",
    "CHAR is a single ASCII letter.",
    "WORD contains only letters.",
    "Lines are separated by `\\n`; ignore blank lines.",
    "Each line's format is well-formed when non-empty."
  ],
  examples: [
    { name: "two valid", args: ["1-3 a: abcde\n1-3 b: cdefg\n2-9 c: ccccccccc"], expected: 2 }
  ],
  entrypoint: "count_valid_tags",
  starterCode:
    "def count_valid_tags(input_text):\n" +
    "    # Count lines where the char appears between min and max times in the word.\n" +
    "    pass\n",
  referenceCode:
    "def count_valid_tags(input_text):\n" +
    "    valid = 0\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        if not line.strip():\n" +
    "            continue\n" +
    "        bounds, rest = line.split(\" \", 1)\n" +
    "        low_str, high_str = bounds.split(\"-\")\n" +
    "        low = int(low_str)\n" +
    "        high = int(high_str)\n" +
    "        char_part, word = rest.split(\": \", 1)\n" +
    "        char = char_part[0]\n" +
    "        count = word.count(char)\n" +
    "        if low <= count <= high:\n" +
    "            valid += 1\n" +
    "    return valid\n",
  solutionCode:
    "def count_valid_tags(input_text):\n" +
    "    total = 0\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        bounds, body = line.split(\" \", 1)\n" +
    "        lo, hi = (int(x) for x in bounds.split(\"-\"))\n" +
    "        letter, _, word = body.partition(\": \")\n" +
    "        if lo <= word.count(letter[0]) <= hi:\n" +
    "            total += 1\n" +
    "    return total\n",
  visibleTests: [
    { name: "two valid", args: ["1-3 a: abcde\n1-3 b: cdefg\n2-9 c: ccccccccc"], expected: 2 },
    { name: "all invalid", args: ["1-1 z: aaa\n2-2 a: aaaa"], expected: 0 },
    { name: "empty input", args: [""], expected: 0 }
  ],
  hiddenTests: [
    { name: "boundary inclusive low", args: ["3-5 q: qqqxx"], expected: 1 },
    { name: "boundary inclusive high", args: ["1-3 z: zzzab"], expected: 1 },
    { name: "ignore blanks", args: ["\n1-1 a: a\n\n"], expected: 1 },
    { name: "mixed letters", args: ["2-4 t: ttabt\n5-9 m: mmmm"], expected: 1 },
    { name: "min equals max strict", args: ["3-3 a: aaa\n3-3 a: aaaa"], expected: 1 },
    { name: "zero min allows missing char", args: ["0-2 a: bcd"], expected: 1 },
    { name: "count over max invalid", args: ["1-2 a: aaaa"], expected: 0 },
    { name: "char absent triggers strict min", args: ["1-5 q: abcde"], expected: 0 }
  ],
  hints: [
    "Split once on the space between bounds and the rest, then once on `\": \"` between the char and the word.",
    "`str.count(char)` returns the number of occurrences in one O(n) scan — no manual loop needed.",
    "The bounds are inclusive on both ends; use `<=` on both sides."
  ],
  solution:
    "Walk lines; skip blanks; split each line into bounds, char, and word using two splits. Count occurrences with `str.count`, then test inclusive bounds. Increment a counter on success.",
  walkthrough:
    "The format is rigid, so two `split` calls handle parsing without a regex. Using `str.count` is the right call: it is both clearer and faster than an explicit loop.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-position-rule",
    title: "Part 2: Exactly one position matches",
    prompt:
      "Same format, new rule. Treat `MIN` and `MAX` as one-indexed positions into the word. The line is valid when exactly one of `word[MIN-1]` and `word[MAX-1]` equals `CHAR`. Both matching or neither matching is invalid. Positions that fall outside the word index never match. Return the count of valid lines.",
    entrypoint: "count_valid_positions",
    starterCode:
      "def count_valid_positions(input_text):\n" +
      "    # Validate using the position rule: exactly one of pos1/pos2 must match.\n" +
      "    pass\n",
    referenceCode:
      "def count_valid_positions(input_text):\n" +
      "    valid = 0\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        if not line.strip():\n" +
      "            continue\n" +
      "        bounds, rest = line.split(\" \", 1)\n" +
      "        a_str, b_str = bounds.split(\"-\")\n" +
      "        a = int(a_str) - 1\n" +
      "        b = int(b_str) - 1\n" +
      "        char_part, word = rest.split(\": \", 1)\n" +
      "        char = char_part[0]\n" +
      "        first = word[a] == char if 0 <= a < len(word) else False\n" +
      "        second = word[b] == char if 0 <= b < len(word) else False\n" +
      "        if first != second:\n" +
      "            valid += 1\n" +
      "    return valid\n",
    solutionCode:
      "def count_valid_positions(input_text):\n" +
      "    count = 0\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        bounds, body = line.split(\" \", 1)\n" +
      "        pa, pb = (int(x) - 1 for x in bounds.split(\"-\"))\n" +
      "        letter, _, word = body.partition(\": \")\n" +
      "        target = letter[0]\n" +
      "        hit_a = 0 <= pa < len(word) and word[pa] == target\n" +
      "        hit_b = 0 <= pb < len(word) and word[pb] == target\n" +
      "        if hit_a ^ hit_b:\n" +
      "            count += 1\n" +
      "    return count\n",
    visibleTests: [
      {
        name: "one position matches",
        args: ["1-3 a: abcde\n1-3 b: cdefg\n2-9 c: ccccccccc"],
        expected: 1
      },
      { name: "both match invalid", args: ["1-2 x: xxaaa"], expected: 0 },
      { name: "neither matches", args: ["2-4 z: abcde"], expected: 0 }
    ],
    hiddenTests: [
      { name: "first only matches", args: ["1-3 q: qabxy"], expected: 1 },
      { name: "second only matches", args: ["1-3 q: aaqxy"], expected: 1 },
      { name: "position out of range counts as no-match", args: ["1-99 a: a"], expected: 1 },
      { name: "blank lines ignored", args: ["\n1-2 z: zx\n"], expected: 1 },
      { name: "both positions out of range invalid", args: ["10-20 a: abc"], expected: 0 },
      { name: "same position twice always invalid", args: ["2-2 a: babcd\n2-2 b: babcd"], expected: 0 },
      { name: "first char index one", args: ["1-3 z: zxz"], expected: 0 }
    ],
    hints: [
      "Compute two booleans (does position a match, does position b match) and combine with XOR.",
      "Guard each position against the word length so out-of-range never indexes into the string.",
      "The two positions are one-indexed — subtract one before indexing."
    ],
    solution:
      "Parse exactly as in Part 1 but interpret the bounds as one-indexed positions. Compute `hit_a` and `hit_b` as bounds-checked equality, then accept when `hit_a XOR hit_b`. The rest of the structure is unchanged.",
    walkthrough:
      "XOR is the cleanest way to express \"exactly one is true\"; chained ifs would work but obscure the symmetry. Guarding the position lets the function survive malformed inputs without raising.",
    complexity: { time: "O(total characters)", space: "O(1)" }
  }
});

const y1d3 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d3-slope-walk",
  title: "Day 3: Slope Walk",
  difficulty: "easy",
  patterns: ["grid traversal", "modular arithmetic"],
  prompt:
    "You receive a grid as a multi-line string of `.` (open) and `#` (tree) characters. The grid repeats horizontally to infinity but not vertically. Starting at row 0 column 0, you step `right=3, down=1` repeatedly until you fall off the bottom. Count how many `#` tiles you pass through (the starting tile counts if and only if it is a tree).",
  constraints: [
    "All rows have the same length.",
    "Movement: column index wraps modulo row length; row index increments without wrapping.",
    "The walk stops when the row index reaches the number of rows.",
    "Return 0 for an empty grid.",
    "Only `.` and `#` appear."
  ],
  examples: [
    { name: "small grid", args: ["..##\n.#..\n#...\n.#.#"], expected: 1 }
  ],
  entrypoint: "slope_walk",
  starterCode:
    "def slope_walk(input_text):\n" +
    "    # Step (right=3, down=1) until falling off; count '#' tiles passed.\n" +
    "    pass\n",
  referenceCode:
    "def slope_walk(input_text):\n" +
    "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
    "    if not rows:\n" +
    "        return 0\n" +
    "    width = len(rows[0])\n" +
    "    trees = 0\n" +
    "    for r in range(len(rows)):\n" +
    "        c = (r * 3) % width\n" +
    "        if rows[r][c] == \"#\":\n" +
    "            trees += 1\n" +
    "    return trees\n",
  solutionCode:
    "def slope_walk(input_text):\n" +
    "    grid = [r for r in input_text.split(\"\\n\") if r]\n" +
    "    if not grid:\n" +
    "        return 0\n" +
    "    w = len(grid[0])\n" +
    "    return sum(1 for r, row in enumerate(grid) if row[(r * 3) % w] == \"#\")\n",
  visibleTests: [
    { name: "small grid", args: ["..##\n.#..\n#...\n.#.#"], expected: 1 },
    { name: "empty", args: [""], expected: 0 },
    { name: "single open row", args: ["...."], expected: 0 },
    { name: "all trees", args: ["####\n####\n####"], expected: 3 }
  ],
  hiddenTests: [
    {
      name: "classic seven-by-eleven",
      args: [
        "..##.......\n#...#...#..\n.#....#..#.\n..#.#...#.#\n.#...##..#.\n..#.##.....\n.#.#.#....#\n.#........#\n#.##...#...\n#...##....#\n.#..#...#.#"
      ],
      expected: 7
    },
    { name: "single row tree at start", args: ["#...."], expected: 1 },
    { name: "wrap immediately", args: ["#.\n.#\n#."], expected: 3 },
    { name: "single row no tree at column zero", args: [".###"], expected: 0 },
    { name: "narrow width wrap hits", args: ["..\n.#"], expected: 1 },
    { name: "trailing newline filtered", args: ["#...\n...#\n..#.\n"], expected: 3 },
    { name: "diagonal hits every row", args: ["#...\n...#\n..#.\n.#.."], expected: 4 }
  ],
  hints: [
    "Row `r` lands on column `(r * 3) % width` — no need to simulate the wrap.",
    "Filter blank lines before computing width so an empty grid does not crash.",
    "A generator expression with `sum` is concise and idiomatic."
  ],
  solution:
    "Strip empty lines, compute row width, then iterate rows. At row `r`, the column is `(r * 3) mod width`. Increment a tree counter when that cell is `#`. Sum at the end.",
  walkthrough:
    "Closed-form column math beats simulating one step per row because the column index is fully determined by row index and the slope. This pattern (state derivable from index) generalizes — Part 2 leans on it.",
  complexity: { time: "O(rows)", space: "O(rows)" },
  part2: {
    id: "part-2-many-slopes",
    title: "Part 2: Multiple slopes",
    prompt:
      "Walk five slopes — `(1,1)`, `(3,1)`, `(5,1)`, `(7,1)`, `(1,2)` (each as `right, down`) — over the same grid. Count trees hit by each slope, then return the product of those five counts. The starting tile counts if it is a tree. The walk for a slope ends as soon as the row index reaches `len(rows)`.",
    entrypoint: "slope_walk_product",
    starterCode:
      "def slope_walk_product(input_text):\n" +
      "    # Multiply tree counts across the five canonical slopes.\n" +
      "    pass\n",
    referenceCode:
      "def slope_walk_product(input_text):\n" +
      "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
      "    if not rows:\n" +
      "        return 0\n" +
      "    width = len(rows[0])\n" +
      "    slopes = [(1, 1), (3, 1), (5, 1), (7, 1), (1, 2)]\n" +
      "    product = 1\n" +
      "    for dx, dy in slopes:\n" +
      "        trees = 0\n" +
      "        r = 0\n" +
      "        c = 0\n" +
      "        while r < len(rows):\n" +
      "            if rows[r][c % width] == \"#\":\n" +
      "                trees += 1\n" +
      "            r += dy\n" +
      "            c += dx\n" +
      "        product *= trees\n" +
      "    return product\n",
    solutionCode:
      "def slope_walk_product(input_text):\n" +
      "    grid = [r for r in input_text.split(\"\\n\") if r]\n" +
      "    if not grid:\n" +
      "        return 0\n" +
      "    w = len(grid[0])\n" +
      "    h = len(grid)\n" +
      "    total = 1\n" +
      "    for dx, dy in ((1, 1), (3, 1), (5, 1), (7, 1), (1, 2)):\n" +
      "        hit = 0\n" +
      "        for step in range((h + dy - 1) // dy):\n" +
      "            r = step * dy\n" +
      "            c = (step * dx) % w\n" +
      "            if r < h and grid[r][c] == \"#\":\n" +
      "                hit += 1\n" +
      "        total *= hit\n" +
      "    return total\n",
    visibleTests: [
      { name: "empty grid", args: [""], expected: 0 },
      {
        name: "classic seven-by-eleven",
        args: [
          "..##.......\n#...#...#..\n.#....#..#.\n..#.#...#.#\n.#...##..#.\n..#.##.....\n.#.#.#....#\n.#........#\n#.##...#...\n#...##....#\n.#..#...#.#"
        ],
        expected: 336
      },
      { name: "single row all trees", args: ["###"], expected: 1 }
    ],
    hiddenTests: [
      { name: "all clear product is zero", args: ["....\n....\n....\n....\n...."], expected: 0 },
      { name: "two-row all trees product", args: ["####\n####"], expected: 16 },
      {
        name: "slopes miss every tree",
        args: ["....\n#...\n....\n#...\n....\n#..."],
        expected: 0
      },
      {
        name: "single row all trees product is one",
        args: ["####"],
        expected: 1
      },
      {
        name: "single column all trees",
        args: ["#\n#\n#\n#\n#"],
        expected: 1875
      }
    ],
    hints: [
      "Pull the single-slope routine out and call it five times.",
      "Watch the vertical step for the (1, 2) slope — the row index advances by 2 each iteration.",
      "Start the product at 1 so the first multiplication preserves the slope's count."
    ],
    solution:
      "Run the single-slope walk for each of the five (dx, dy) pairs and multiply the counts. The (1, 2) slope visits `ceil(rows / 2)` cells, so the loop must use the slope's `dy`, not a hard-coded step of 1.",
    walkthrough:
      "If you factor the per-slope work into its own helper, this becomes a one-line product. The temptation is to special-case (1, 2); resist it — the general `r += dy` works for all five slopes.",
    complexity: { time: "O(rows * slopes)", space: "O(rows)" }
  }
});

const y1d4 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d4-manifest-records",
  title: "Day 4: Manifest Records",
  difficulty: "medium",
  patterns: ["multi-line records", "field validation"],
  prompt:
    "The input is a list of records separated by blank lines. Within a record, fields are `key:value` tokens separated by spaces or single newlines. Count the records that contain all of these required keys: `id`, `name`, `age`, `grade`, `cohort`. Extra keys are allowed and ignored.",
  constraints: [
    "Records are separated by an empty line (`\\n\\n`).",
    "Keys and values do not contain whitespace.",
    "A field is exactly `key:value` with one colon.",
    "Required keys: `id`, `name`, `age`, `grade`, `cohort`.",
    "Return 0 for empty input."
  ],
  examples: [
    {
      name: "one valid one missing",
      args: ["id:1 name:A age:20 grade:B cohort:fall\nextra:hi\n\nid:2 name:B age:21 grade:A"],
      expected: 1
    }
  ],
  entrypoint: "count_complete_records",
  starterCode:
    "def count_complete_records(input_text):\n" +
    "    # Count records that contain all five required keys.\n" +
    "    pass\n",
  referenceCode:
    "def count_complete_records(input_text):\n" +
    "    required = {\"id\", \"name\", \"age\", \"grade\", \"cohort\"}\n" +
    "    count = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        if not block.strip():\n" +
    "            continue\n" +
    "        keys = set()\n" +
    "        for token in block.split():\n" +
    "            if \":\" in token:\n" +
    "                key, _ = token.split(\":\", 1)\n" +
    "                keys.add(key)\n" +
    "        if required <= keys:\n" +
    "            count += 1\n" +
    "    return count\n",
  solutionCode:
    "def count_complete_records(input_text):\n" +
    "    needed = {\"id\", \"name\", \"age\", \"grade\", \"cohort\"}\n" +
    "    total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        present = {tok.split(\":\", 1)[0] for tok in block.split() if \":\" in tok}\n" +
    "        if needed.issubset(present):\n" +
    "            total += 1\n" +
    "    return total\n",
  visibleTests: [
    {
      name: "one valid one missing",
      args: ["id:1 name:A age:20 grade:B cohort:fall\nextra:hi\n\nid:2 name:B age:21 grade:A"],
      expected: 1
    },
    { name: "empty input", args: [""], expected: 0 },
    {
      name: "all valid",
      args: ["id:1 name:X age:30 grade:C cohort:fall\n\nid:2 name:Y age:31 grade:D cohort:spring"],
      expected: 2
    }
  ],
  hiddenTests: [
    {
      name: "extra fields ignored",
      args: ["id:1 name:A age:20 grade:B cohort:fall hair:red eye:blue"],
      expected: 1
    },
    {
      name: "fields across lines within block",
      args: ["id:1 name:A\nage:20 grade:B\ncohort:fall"],
      expected: 1
    },
    {
      name: "missing single key",
      args: ["id:1 name:A age:20 grade:B"],
      expected: 0
    },
    {
      name: "three records mixed",
      args: [
        "id:1 name:A age:20 grade:B cohort:fall\n\nid:2 name:B age:21\n\nid:3 name:C age:22 grade:D cohort:spring"
      ],
      expected: 2
    },
    {
      name: "single record missing each required key",
      args: ["name:A age:20 grade:B cohort:fall"],
      expected: 0
    },
    {
      name: "duplicate key still counts once",
      args: ["id:1 id:2 name:A age:20 grade:B cohort:fall"],
      expected: 1
    },
    {
      name: "trailing blank lines do not add fake records",
      args: ["id:1 name:A age:20 grade:B cohort:fall\n\n\n\n"],
      expected: 1
    },
    {
      name: "leading blank lines tolerated",
      args: ["\n\nid:1 name:A age:20 grade:B cohort:fall"],
      expected: 1
    },
    {
      name: "token without colon ignored",
      args: ["id:1 name:A age:20 grade:B cohort:fall bareword anothertoken"],
      expected: 1
    }
  ],
  hints: [
    "Split the input on `\\n\\n` to get one block per record.",
    "Within a block, `str.split()` (no arg) splits on any whitespace — handles both spaces and newlines.",
    "Use a set subset check (`required <= keys`) to test \"all required present\"."
  ],
  solution:
    "Split on `\\n\\n` to get per-record blocks. For each block, gather the key part of each `key:value` token into a set. The record is complete when the required-key set is a subset of the gathered keys.",
  walkthrough:
    "Set subset is more readable than a chain of `in` checks and is symmetric in its arguments. Whitespace-agnostic splitting drops the need to special-case multi-line records.",
  complexity: { time: "O(total characters)", space: "O(fields per record)" },
  part2: {
    id: "part-2-validated-values",
    title: "Part 2: Validate field values",
    prompt:
      "Same required keys. Now also validate each required field's value. Rules: `id` is exactly 9 digits. `name` has 1 to 32 letters or hyphens. `age` is an integer between 16 and 99 inclusive. `grade` is one of `A`, `B`, `C`, `D`, `F`. `cohort` is one of `fall`, `winter`, `spring`, `summer`. A record is valid only when every required key is present and every required value matches its rule. Return the count of valid records.",
    entrypoint: "count_strict_records",
    starterCode:
      "def count_strict_records(input_text):\n" +
      "    # Required keys present AND every required value passes its rule.\n" +
      "    pass\n",
    referenceCode:
      "def count_strict_records(input_text):\n" +
      "    seasons = {\"fall\", \"winter\", \"spring\", \"summer\"}\n" +
      "    grades = {\"A\", \"B\", \"C\", \"D\", \"F\"}\n" +
      "    required = {\"id\", \"name\", \"age\", \"grade\", \"cohort\"}\n" +
      "    valid = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        if not block.strip():\n" +
      "            continue\n" +
      "        fields = {}\n" +
      "        for token in block.split():\n" +
      "            if \":\" in token:\n" +
      "                key, value = token.split(\":\", 1)\n" +
      "                fields[key] = value\n" +
      "        if not required <= set(fields):\n" +
      "            continue\n" +
      "        if not (fields[\"id\"].isdigit() and len(fields[\"id\"]) == 9):\n" +
      "            continue\n" +
      "        name = fields[\"name\"]\n" +
      "        if not (1 <= len(name) <= 32 and all(c.isalpha() or c == \"-\" for c in name)):\n" +
      "            continue\n" +
      "        age_str = fields[\"age\"]\n" +
      "        if not age_str.isdigit() or not (16 <= int(age_str) <= 99):\n" +
      "            continue\n" +
      "        if fields[\"grade\"] not in grades:\n" +
      "            continue\n" +
      "        if fields[\"cohort\"] not in seasons:\n" +
      "            continue\n" +
      "        valid += 1\n" +
      "    return valid\n",
    solutionCode:
      "def count_strict_records(input_text):\n" +
      "    def ok(fields):\n" +
      "        for key in (\"id\", \"name\", \"age\", \"grade\", \"cohort\"):\n" +
      "            if key not in fields:\n" +
      "                return False\n" +
      "        if not (fields[\"id\"].isdigit() and len(fields[\"id\"]) == 9):\n" +
      "            return False\n" +
      "        name = fields[\"name\"]\n" +
      "        if not (1 <= len(name) <= 32) or not all(c.isalpha() or c == \"-\" for c in name):\n" +
      "            return False\n" +
      "        if not fields[\"age\"].isdigit() or not 16 <= int(fields[\"age\"]) <= 99:\n" +
      "            return False\n" +
      "        if fields[\"grade\"] not in {\"A\", \"B\", \"C\", \"D\", \"F\"}:\n" +
      "            return False\n" +
      "        if fields[\"cohort\"] not in {\"fall\", \"winter\", \"spring\", \"summer\"}:\n" +
      "            return False\n" +
      "        return True\n" +
      "    total = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        fields = {}\n" +
      "        for tok in block.split():\n" +
      "            if \":\" in tok:\n" +
      "                k, v = tok.split(\":\", 1)\n" +
      "                fields[k] = v\n" +
      "        if ok(fields):\n" +
      "            total += 1\n" +
      "    return total\n",
    visibleTests: [
      {
        name: "all rules pass",
        args: ["id:123456789 name:Ada age:30 grade:A cohort:fall"],
        expected: 1
      },
      {
        name: "bad id length",
        args: ["id:12345 name:Ada age:30 grade:A cohort:fall"],
        expected: 0
      },
      {
        name: "age out of range",
        args: ["id:123456789 name:Ada age:14 grade:A cohort:fall"],
        expected: 0
      },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      {
        name: "bad grade",
        args: ["id:111222333 name:B age:20 grade:E cohort:spring"],
        expected: 0
      },
      {
        name: "bad cohort",
        args: ["id:111222333 name:B age:20 grade:A cohort:autumn"],
        expected: 0
      },
      {
        name: "name with hyphen",
        args: ["id:111222333 name:Ada-Lovelace age:30 grade:B cohort:winter"],
        expected: 1
      },
      {
        name: "name with digits invalid",
        args: ["id:111222333 name:Ada2 age:30 grade:B cohort:winter"],
        expected: 0
      },
      {
        name: "age at lower bound",
        args: ["id:111222333 name:B age:16 grade:A cohort:spring"],
        expected: 1
      },
      {
        name: "age at upper bound",
        args: ["id:111222333 name:B age:99 grade:A cohort:spring"],
        expected: 1
      },
      {
        name: "age one over upper bound",
        args: ["id:111222333 name:B age:100 grade:A cohort:spring"],
        expected: 0
      },
      {
        name: "id with letter rejected",
        args: ["id:11122233a name:B age:30 grade:A cohort:spring"],
        expected: 0
      },
      {
        name: "name longer than 32 rejected",
        args: ["id:111222333 name:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa age:30 grade:A cohort:spring"],
        expected: 0
      },
      {
        name: "two records one valid one missing key",
        args: ["id:111222333 name:A age:30 grade:A cohort:spring\n\nname:B age:30 grade:A cohort:spring"],
        expected: 1
      }
    ],
    hints: [
      "Extract the fields first; then run a sequence of independent rule checks.",
      "Use `str.isdigit` and `str.isalpha` for the character-class checks; both are O(n).",
      "Early-return when any rule fails so the rule chain stays flat and readable."
    ],
    solution:
      "Parse blocks into a `{key: value}` dict per record. Then for each block, run a series of guard clauses — required keys present, id is 9 digits, name length and char class, age range, grade enum, cohort enum. Count blocks that survive every guard.",
    walkthrough:
      "Guard clauses keep the rule list flat. Each rule does one thing. If any new rule were to be added (height, citizen ID, color code), it would slot in as one more `if not ... continue`.",
    complexity: { time: "O(total characters)", space: "O(fields per record)" }
  }
});

const y1d5 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d5-seat-codes",
  title: "Day 5: Seat Codes",
  difficulty: "medium",
  patterns: ["binary encoding", "scan", "max"],
  prompt:
    "Each non-empty line is a 10-character seat code. The first 7 characters are `F` (front, lower half) or `B` (back, upper half) and binary-partition the row range 0-127. The last 3 characters are `L` (left, lower half) or `R` (right, upper half) and binary-partition the column range 0-7. The seat ID is `row * 8 + column`. Return the maximum seat ID across all codes.",
  constraints: [
    "Lines are separated by `\\n`.",
    "Each non-empty line is exactly 10 characters long.",
    "Characters in positions 0-6 are `F` or `B`; characters in positions 7-9 are `L` or `R`.",
    "Return -1 for an input with no non-empty lines.",
    "Computation is deterministic with no ties to break."
  ],
  examples: [
    { name: "two codes", args: ["FBFBBFFRLR\nBFFFBBFRRR"], expected: 567 }
  ],
  entrypoint: "max_seat_id",
  starterCode:
    "def max_seat_id(input_text):\n" +
    "    # Decode each 10-char code to a seat ID and return the maximum.\n" +
    "    pass\n",
  referenceCode:
    "def max_seat_id(input_text):\n" +
    "    best = -1\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        bits = line.replace(\"F\", \"0\").replace(\"B\", \"1\").replace(\"L\", \"0\").replace(\"R\", \"1\")\n" +
    "        seat_id = int(bits, 2)\n" +
    "        if seat_id > best:\n" +
    "            best = seat_id\n" +
    "    return best\n",
  solutionCode:
    "def max_seat_id(input_text):\n" +
    "    def decode(code):\n" +
    "        bits = 0\n" +
    "        for ch in code:\n" +
    "            bits = (bits << 1) | (1 if ch in \"BR\" else 0)\n" +
    "        return bits\n" +
    "    best = -1\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        seat = decode(line)\n" +
    "        if seat > best:\n" +
    "            best = seat\n" +
    "    return best\n",
  visibleTests: [
    { name: "two codes", args: ["FBFBBFFRLR\nBFFFBBFRRR"], expected: 567 },
    { name: "three codes", args: ["FFFBBBFRRR\nBBFFBBFRLL\nFBFBBFFRLR"], expected: 820 },
    { name: "empty input", args: [""], expected: -1 }
  ],
  hiddenTests: [
    { name: "single code", args: ["FBFBBFFRLR"], expected: 357 },
    { name: "front-left zero", args: ["FFFFFFFLLL"], expected: 0 },
    { name: "back-right max", args: ["BBBBBBBRRR"], expected: 1023 },
    { name: "blank lines ignored", args: ["\nFBFBBFFRLR\n\nBFFFBBFRRR\n"], expected: 567 },
    { name: "lowest column wins over higher column same row", args: ["FFFFFFFRLL\nFFFFFFFLLR"], expected: 4 },
    { name: "row math row 1 col 0 is id 8", args: ["FFFFFFBLLL"], expected: 8 },
    { name: "all rows same column varies", args: ["FFFFFFFLLL\nBFFFFFFLLL\nFBFFFFFLLL"], expected: 512 }
  ],
  hints: [
    "Each code is a 10-bit binary number once you map F/L to 0 and B/R to 1.",
    "Row * 8 + column is exactly the integer value of all ten bits — the multiplication is implicit.",
    "Track a running maximum to avoid building an intermediate list."
  ],
  solution:
    "Map F and L to 0, B and R to 1. The resulting 10-bit binary number is precisely `row * 8 + column`, so no separate row/column decode is needed. Walk lines, decode each, and keep the running maximum.",
  walkthrough:
    "The binary-partition framing is a red herring — the encoding IS already binary. Once you see that, the decode collapses to a two-character substitution plus `int(..., 2)`.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-missing-seat",
    title: "Part 2: Missing seat",
    prompt:
      "Decode the same way, but now find your own seat: it is the single seat ID that is missing from the set of decoded IDs, while both `id - 1` and `id + 1` are present. Return that ID. If no such seat exists, return -1.",
    entrypoint: "find_missing_seat",
    starterCode:
      "def find_missing_seat(input_text):\n" +
      "    # Find the seat ID where both neighbours exist but the seat itself is missing.\n" +
      "    pass\n",
    referenceCode:
      "def find_missing_seat(input_text):\n" +
      "    ids = set()\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        bits = line.replace(\"F\", \"0\").replace(\"B\", \"1\").replace(\"L\", \"0\").replace(\"R\", \"1\")\n" +
      "        ids.add(int(bits, 2))\n" +
      "    if not ids:\n" +
      "        return -1\n" +
      "    lo = min(ids)\n" +
      "    hi = max(ids)\n" +
      "    for candidate in range(lo + 1, hi):\n" +
      "        if candidate not in ids and (candidate - 1) in ids and (candidate + 1) in ids:\n" +
      "            return candidate\n" +
      "    return -1\n",
    solutionCode:
      "def find_missing_seat(input_text):\n" +
      "    def decode(code):\n" +
      "        v = 0\n" +
      "        for ch in code:\n" +
      "            v = (v << 1) | (1 if ch in \"BR\" else 0)\n" +
      "        return v\n" +
      "    seats = set()\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if line:\n" +
      "            seats.add(decode(line))\n" +
      "    if not seats:\n" +
      "        return -1\n" +
      "    for seat in sorted(seats):\n" +
      "        if seat + 1 not in seats and seat + 2 in seats:\n" +
      "            return seat + 1\n" +
      "    return -1\n",
    visibleTests: [
      {
        name: "missing in middle",
        args: ["FFFFFFFLLL\nFFFFFFFLLR\nFFFFFFFLRR\nFFFFFFFRLL"],
        expected: 2
      },
      { name: "empty", args: [""], expected: -1 },
      { name: "no gap", args: ["FFFFFFFLLL\nFFFFFFFLLR"], expected: -1 }
    ],
    hiddenTests: [
      {
        name: "missing seat surrounded",
        args: ["FFFFFFFLLL\nFFFFFFFLRL\nFFFFFFFLRR"],
        expected: 1
      },
      {
        name: "edge of range not counted",
        args: ["FFFFFFFLLR\nFFFFFFFLRL"],
        expected: -1
      },
      { name: "single seat", args: ["FBFBBFFRLR"], expected: -1 },
      {
        name: "two distinct gaps return smallest",
        args: ["FFFFFFFLLL\nFFFFFFFLRL\nFFFFFFFLRR\nFFFFFFFRLR\nFFFFFFFRRR"],
        expected: 1
      },
      {
        name: "gap of three returns minus one",
        args: ["FFFFFFFLLL\nFFFFFFFRLR"],
        expected: -1
      },
      {
        name: "duplicate codes still find gap",
        args: ["FFFFFFFLLL\nFFFFFFFLLL\nFFFFFFFLRL"],
        expected: 1
      }
    ],
    hints: [
      "Decode every code into a set of integer seat IDs.",
      "Scan the sorted IDs and look for a jump of exactly 2 between consecutive entries.",
      "The missing ID is the predecessor's ID plus one."
    ],
    solution:
      "Build a set of decoded seat IDs. Sort them, then look for two consecutive IDs that differ by exactly 2 — the missing one is the one in between, and both neighbours exist by construction.",
    walkthrough:
      "Sorting once and scanning beats range-based scanning across `[min..max]` for sparse inputs, and keeps the answer obvious from the data.",
    complexity: { time: "O(n log n) from the sort", space: "O(n)" }
  }
});

const y1d6 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d6-group-answers",
  title: "Day 6: Group Answers",
  difficulty: "easy",
  patterns: ["multi-line records", "set union"],
  prompt:
    "Records are separated by blank lines. Within a record, each non-empty line is one person's answer string of lowercase letters; each letter represents one `yes` answer. For each group, compute the number of distinct letters that appear in at least one person's line. Return the sum of those counts across all groups.",
  constraints: [
    "Records are separated by `\\n\\n`.",
    "Each non-empty line within a record is one person's answers.",
    "Each character in a person's line is a lowercase ASCII letter; duplicates within one person's line count once.",
    "Return 0 if there are no groups.",
    "An empty group contributes 0."
  ],
  examples: [
    { name: "two groups", args: ["abc\n\nabac"], expected: 6 }
  ],
  entrypoint: "anyone_yes_sum",
  starterCode:
    "def anyone_yes_sum(input_text):\n" +
    "    # Sum across groups of the count of letters anyone in the group answered yes to.\n" +
    "    pass\n",
  referenceCode:
    "def anyone_yes_sum(input_text):\n" +
    "    total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        union = set()\n" +
    "        for line in block.split(\"\\n\"):\n" +
    "            line = line.strip()\n" +
    "            if not line:\n" +
    "                continue\n" +
    "            union.update(line)\n" +
    "        total += len(union)\n" +
    "    return total\n",
  solutionCode:
    "def anyone_yes_sum(input_text):\n" +
    "    sum_total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        seen = set()\n" +
    "        for ln in block.split(\"\\n\"):\n" +
    "            seen |= set(ln.strip())\n" +
    "        seen.discard(\"\")\n" +
    "        sum_total += len(seen)\n" +
    "    return sum_total\n",
  visibleTests: [
    { name: "two simple groups", args: ["abc\n\nabac"], expected: 6 },
    { name: "single group", args: ["abc"], expected: 3 },
    { name: "empty", args: [""], expected: 0 }
  ],
  hiddenTests: [
    { name: "duplicates within one line", args: ["aaaa\n\nbbbb"], expected: 2 },
    { name: "multi-line group", args: ["a\nb\nc\n\nab\nac"], expected: 6 },
    { name: "all letters", args: ["abcdefghijklmnopqrstuvwxyz"], expected: 26 },
    { name: "blank trailing block", args: ["abc\n\n\n"], expected: 3 },
    { name: "duplicates across multiple lines", args: ["ab\nab\nab"], expected: 2 },
    { name: "leading blank block", args: ["\n\nabc"], expected: 3 },
    { name: "many groups", args: ["a\n\nb\n\nc\n\nd\n\ne"], expected: 5 },
    { name: "wide spans", args: ["abcdef\nghijkl\n\nmnopqr"], expected: 18 }
  ],
  hints: [
    "Treat each person's line as a set of letters; the group's anyone-yes count is the set union.",
    "Use `set.update` or `|=` to accumulate per-line characters.",
    "Discard the empty string before counting if you used `set('') = {''}` — though `set(' ').update('')` is harmless."
  ],
  solution:
    "Split the input into blocks on blank lines. For each block, build a single set of all characters across all non-empty lines. The size of that set is the group's count; sum across groups.",
  walkthrough:
    "Sets do all the work — both the deduplication within a person's line and the union across people. The whole problem becomes `sum(len(union) for block in blocks)`.",
  complexity: { time: "O(total characters)", space: "O(alphabet size)" },
  part2: {
    id: "part-2-everyone-yes",
    title: "Part 2: Everyone-yes",
    prompt:
      "Now compute, for each group, the number of letters that every person in the group answered yes to. That is the set intersection across the group's persons. Sum across groups. An empty group contributes 0.",
    entrypoint: "everyone_yes_sum",
    starterCode:
      "def everyone_yes_sum(input_text):\n" +
      "    # Sum across groups of the count of letters EVERY person in the group said yes to.\n" +
      "    pass\n",
    referenceCode:
      "def everyone_yes_sum(input_text):\n" +
      "    total = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        persons = [line.strip() for line in block.split(\"\\n\") if line.strip()]\n" +
      "        if not persons:\n" +
      "            continue\n" +
      "        intersection = set(persons[0])\n" +
      "        for person in persons[1:]:\n" +
      "            intersection &= set(person)\n" +
      "        total += len(intersection)\n" +
      "    return total\n",
    solutionCode:
      "def everyone_yes_sum(input_text):\n" +
      "    out = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        people = [set(p.strip()) for p in block.split(\"\\n\") if p.strip()]\n" +
      "        if not people:\n" +
      "            continue\n" +
      "        common = people[0]\n" +
      "        for person in people[1:]:\n" +
      "            common &= person\n" +
      "        out += len(common)\n" +
      "    return out\n",
    visibleTests: [
      { name: "two multi-person groups", args: ["abc\nbcd\n\nef\nfg"], expected: 3 },
      { name: "single person", args: ["abc"], expected: 3 },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      { name: "all share none", args: ["a\nb\nc"], expected: 0 },
      { name: "all share one", args: ["ab\nac\nad"], expected: 1 },
      { name: "mixed groups", args: ["ab\nac\n\nef\nef\n\nx"], expected: 4 },
      { name: "blank group skipped", args: ["abc\n\n\n\ndef\nde"], expected: 5 },
      { name: "identical answers across group", args: ["abc\nabc\nabc"], expected: 3 },
      { name: "intersection shrinks each step", args: ["abcd\nabc\nab\na"], expected: 1 },
      { name: "two groups one empty intersection", args: ["a\nb\n\nx\nx"], expected: 1 },
      { name: "single letter unanimous", args: ["a\na\na"], expected: 1 }
    ],
    hints: [
      "Convert each person's line to a set up-front so intersection is a single `&=`.",
      "Start the running intersection at the first person's set, then `&=` each remaining person.",
      "Skip groups that have no persons so the initial-set step does not crash."
    ],
    solution:
      "For each non-empty group, convert each person's line to a set of letters and reduce with set intersection. Sum the sizes of the resulting per-group intersections. An empty group is skipped because intersection has no identity element to start from.",
    walkthrough:
      "Intersection is associative and commutative, so the seed-then-reduce pattern is straightforward. The only edge case is groups with zero persons (empty input or trailing blank lines); guard once and the rest is clean.",
    complexity: { time: "O(total characters)", space: "O(alphabet size)" }
  }
});

const y1d7 = aocProblem({
  setId: Y1_SET_ID,
  id: "aoc-y1-d7-container-rules",
  title: "Day 7: Container Rules",
  difficulty: "medium",
  patterns: ["graph", "DFS", "memoization"],
  prompt:
    "Each non-empty line describes a colored container's contents in this exact shape:\n\n`<adjective> <color> containers hold <body>.`\n\nThe body is either the literal string `no other containers` or a comma-separated list of `<n> <adjective> <color> container[s]` entries (`container` for n=1, `containers` otherwise). The container's identifier is the two-word `<adjective> <color>` phrase. Return the number of distinct container identifiers from which a `bright gold` container is reachable, where \"reachable\" means: directly contained, or transitively contained through any chain.",
  constraints: [
    "Line shape is exactly as described; identifiers are two lowercase words.",
    "`no other containers` means zero children.",
    "Counts in the body are positive integers.",
    "The target identifier is exactly `bright gold` and is not counted as containing itself.",
    "Return 0 if `bright gold` never appears as a child."
  ],
  examples: [
    {
      name: "three containers reach gold",
      args: [
        "dim red containers hold 1 bright gold container.\nplain blue containers hold 1 dim red container.\nbright gold containers hold no other containers."
      ],
      expected: 2
    }
  ],
  entrypoint: "count_containers_holding_gold",
  starterCode:
    "def count_containers_holding_gold(input_text):\n" +
    "    # Build the contains-graph, then count ancestors of 'bright gold'.\n" +
    "    pass\n",
  referenceCode:
    "import re\n\n" +
    "def count_containers_holding_gold(input_text):\n" +
    "    contains = {}\n" +
    "    line_re = re.compile(r\"^(\\w+ \\w+) containers hold (.+)\\.$\")\n" +
    "    child_re = re.compile(r\"(\\d+) (\\w+ \\w+) containers?\")\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        match = line_re.match(line)\n" +
    "        if not match:\n" +
    "            continue\n" +
    "        parent = match.group(1)\n" +
    "        body = match.group(2)\n" +
    "        children = []\n" +
    "        if body != \"no other containers\":\n" +
    "            for count_str, name in child_re.findall(body):\n" +
    "                children.append((int(count_str), name))\n" +
    "        contains[parent] = children\n" +
    "    parents = {}\n" +
    "    for parent, children in contains.items():\n" +
    "        for _, child in children:\n" +
    "            parents.setdefault(child, []).append(parent)\n" +
    "    visited = set()\n" +
    "    stack = list(parents.get(\"bright gold\", []))\n" +
    "    while stack:\n" +
    "        node = stack.pop()\n" +
    "        if node in visited:\n" +
    "            continue\n" +
    "        visited.add(node)\n" +
    "        stack.extend(parents.get(node, []))\n" +
    "    return len(visited)\n",
  solutionCode:
    "import re\n\n" +
    "def count_containers_holding_gold(input_text):\n" +
    "    parent_re = re.compile(r\"^(\\w+ \\w+) containers hold (.+)\\.$\")\n" +
    "    child_re = re.compile(r\"(\\d+) (\\w+ \\w+) containers?\")\n" +
    "    parents_of = {}\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        m = parent_re.match(line)\n" +
    "        if not m:\n" +
    "            continue\n" +
    "        parent, body = m.group(1), m.group(2)\n" +
    "        if body == \"no other containers\":\n" +
    "            continue\n" +
    "        for _, child in child_re.findall(body):\n" +
    "            parents_of.setdefault(child, set()).add(parent)\n" +
    "    seen = set()\n" +
    "    stack = list(parents_of.get(\"bright gold\", set()))\n" +
    "    while stack:\n" +
    "        node = stack.pop()\n" +
    "        if node in seen:\n" +
    "            continue\n" +
    "        seen.add(node)\n" +
    "        stack.extend(parents_of.get(node, ()))\n" +
    "    return len(seen)\n",
  visibleTests: [
    {
      name: "two ancestors",
      args: [
        "dim red containers hold 1 bright gold container.\nplain blue containers hold 1 dim red container.\nbright gold containers hold no other containers."
      ],
      expected: 2
    },
    {
      name: "no gold",
      args: ["plain blue containers hold 1 dim red container.\ndim red containers hold no other containers."],
      expected: 0
    },
    { name: "empty", args: [""], expected: 0 }
  ],
  hiddenTests: [
    {
      name: "diamond inheritance",
      args: [
        "outer one containers hold 1 mid a container, 1 mid b container.\nmid a containers hold 1 bright gold container.\nmid b containers hold 1 bright gold container.\nbright gold containers hold no other containers."
      ],
      expected: 3
    },
    {
      name: "deep chain",
      args: [
        "a one containers hold 1 b two container.\nb two containers hold 1 c three container.\nc three containers hold 1 bright gold container.\nbright gold containers hold no other containers."
      ],
      expected: 3
    },
    {
      name: "branching with extras",
      args: [
        "alpha box containers hold 2 bright gold containers, 1 ignored leaf container.\nbeta box containers hold 1 alpha box container.\nignored leaf containers hold no other containers.\nbright gold containers hold no other containers."
      ],
      expected: 2
    },
    {
      name: "gold contains things does not count itself",
      args: [
        "bright gold containers hold 2 plain red containers.\nplain red containers hold no other containers."
      ],
      expected: 0
    },
    {
      name: "irrelevant island ignored",
      args: [
        "lone alpha containers hold 1 lone beta container.\nlone beta containers hold no other containers.\nshiny silver containers hold 1 bright gold container.\nbright gold containers hold no other containers."
      ],
      expected: 1
    },
    {
      name: "multiple direct parents",
      args: [
        "red one containers hold 1 bright gold container.\nblue two containers hold 1 bright gold container.\ngreen three containers hold 1 bright gold container.\nbright gold containers hold no other containers."
      ],
      expected: 3
    },
    {
      name: "cycle-free DAG with shared ancestor",
      args: [
        "top root containers hold 1 mid one container, 1 mid two container.\nmid one containers hold 1 bright gold container.\nmid two containers hold 1 mid one container.\nbright gold containers hold no other containers."
      ],
      expected: 3
    }
  ],
  hints: [
    "Build the directed contains-graph from the parsed rules, then invert it to get parents-of.",
    "Run a flood-fill (BFS or DFS) starting from `bright gold` along the parents-of edges.",
    "A `set` of visited nodes handles both deduplication and the answer count in one step."
  ],
  solution:
    "Parse each rule with a small regex into a parent identifier and a list of `(count, child)` pairs. Build a reverse mapping `child -> parents`. Run a flood-fill from `bright gold` along the reverse edges; the answer is the number of distinct nodes visited (excluding the start).",
  walkthrough:
    "Reversing the graph turns \"which colors can contain gold\" into \"what nodes are reachable from gold along the inverted edges,\" which is a textbook flood-fill. A visited set keeps the search linear and handles arbitrary fan-in.",
  complexity: { time: "O(rules + edges)", space: "O(nodes)" },
  part2: {
    id: "part-2-total-bags-inside",
    title: "Part 2: Total contents",
    prompt:
      "Same input. Now compute the total number of containers that end up inside a single `bright gold` container, counted with multiplicities. If a `bright gold` contains 2 `dim red` and each `dim red` contains 3 `plain blue`, the total is `2 + 2 * 3 = 8`. The `bright gold` container itself is not counted. Return that integer.",
    entrypoint: "total_inside_gold",
    starterCode:
      "def total_inside_gold(input_text):\n" +
      "    # Total containers strictly inside one 'bright gold'.\n" +
      "    pass\n",
    referenceCode:
      "import re\n\n" +
      "def total_inside_gold(input_text):\n" +
      "    line_re = re.compile(r\"^(\\w+ \\w+) containers hold (.+)\\.$\")\n" +
      "    child_re = re.compile(r\"(\\d+) (\\w+ \\w+) containers?\")\n" +
      "    contains = {}\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        m = line_re.match(line)\n" +
      "        if not m:\n" +
      "            continue\n" +
      "        parent = m.group(1)\n" +
      "        body = m.group(2)\n" +
      "        if body == \"no other containers\":\n" +
      "            contains[parent] = []\n" +
      "            continue\n" +
      "        contains[parent] = [(int(c), name) for c, name in child_re.findall(body)]\n" +
      "    memo = {}\n" +
      "    def total(node):\n" +
      "        if node in memo:\n" +
      "            return memo[node]\n" +
      "        result = 0\n" +
      "        for count, child in contains.get(node, []):\n" +
      "            result += count + count * total(child)\n" +
      "        memo[node] = result\n" +
      "        return result\n" +
      "    return total(\"bright gold\")\n",
    solutionCode:
      "import re\n" +
      "from functools import lru_cache\n\n" +
      "def total_inside_gold(input_text):\n" +
      "    pat_line = re.compile(r\"^(\\w+ \\w+) containers hold (.+)\\.$\")\n" +
      "    pat_child = re.compile(r\"(\\d+) (\\w+ \\w+) containers?\")\n" +
      "    contains = {}\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        m = pat_line.match(line)\n" +
      "        if not m:\n" +
      "            continue\n" +
      "        parent, body = m.group(1), m.group(2)\n" +
      "        contains[parent] = ([] if body == \"no other containers\"\n" +
      "                            else [(int(n), name) for n, name in pat_child.findall(body)])\n" +
      "\n" +
      "    @lru_cache(maxsize=None)\n" +
      "    def total(node):\n" +
      "        return sum(n + n * total(child) for n, child in contains.get(node, []))\n" +
      "\n" +
      "    return total(\"bright gold\")\n",
    visibleTests: [
      {
        name: "simple chain",
        args: [
          "bright gold containers hold 2 dim red containers.\ndim red containers hold 3 plain blue containers.\nplain blue containers hold no other containers."
        ],
        expected: 8
      },
      {
        name: "gold has no children",
        args: ["bright gold containers hold no other containers."],
        expected: 0
      },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      {
        name: "two child colors",
        args: [
          "bright gold containers hold 1 dim red container, 2 plain blue containers.\ndim red containers hold no other containers.\nplain blue containers hold 1 tiny pink container.\ntiny pink containers hold no other containers."
        ],
        expected: 5
      },
      {
        name: "shared subtree",
        args: [
          "bright gold containers hold 2 stage a containers.\nstage a containers hold 2 stage b containers.\nstage b containers hold no other containers."
        ],
        expected: 6
      },
      {
        name: "deep chain",
        args: [
          "bright gold containers hold 1 first chamber container.\nfirst chamber containers hold 1 second chamber container.\nsecond chamber containers hold 1 third chamber container.\nthird chamber containers hold no other containers."
        ],
        expected: 3
      },
      {
        name: "single child count multiplies down",
        args: [
          "bright gold containers hold 3 sub one containers.\nsub one containers hold 4 sub two containers.\nsub two containers hold no other containers."
        ],
        expected: 15
      },
      {
        name: "branching count multiplies cleanly",
        args: [
          "bright gold containers hold 2 alpha box containers, 3 beta box containers.\nalpha box containers hold 1 inner one container.\nbeta box containers hold no other containers.\ninner one containers hold no other containers."
        ],
        expected: 7
      },
      {
        name: "diamond pays both paths",
        args: [
          "bright gold containers hold 2 mid one containers, 3 mid two containers.\nmid one containers hold 1 leaf alpha container.\nmid two containers hold 1 leaf alpha container.\nleaf alpha containers hold no other containers."
        ],
        expected: 10
      }
    ],
    hints: [
      "Each container's total is the sum over children of `count + count * total(child)`.",
      "Memoize per identifier so a shared subtree is not re-explored.",
      "Treat `bright gold` like any other node — its total is what you return."
    ],
    solution:
      "Recurse from `bright gold`: for each (count, child) pair under the current node, add `count + count * total(child)`. Memoize by node identifier so any shared subtree is solved once. Containers with no children contribute 0.",
    walkthrough:
      "This is multiplicative DP on a DAG. Without memoization the recurrence blows up on diamonds; with memoization each node is solved once, so the work is proportional to the number of distinct nodes plus their outgoing edges.",
    complexity: { time: "O(nodes + edges)", space: "O(nodes)" }
  }
});

// ============================================================================
// YEAR 2 — Vault Inventory (cataloging an underground vault)
// ============================================================================

const Y2_SET_ID = "aoc-year-2";

const y2d1 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d1-relic-pair",
  title: "Day 1: Relic Pair",
  difficulty: "warmup",
  patterns: ["parsing", "two-pointer", "sorted scan"],
  prompt:
    "The input lists relic weights, one positive integer per non-empty line. Two relics balance when their weights are equal. Return the number of unordered relic pairs `(i, j)` with `i < j` such that `weights[i] == weights[j]`.",
  constraints: [
    "Each non-empty line is a positive integer.",
    "Order of input does not affect the count.",
    "Pairs are unordered: each {i, j} counts once.",
    "Blank lines are skipped.",
    "Return 0 if fewer than two readings are present."
  ],
  examples: [
    { name: "two balanced", args: ["5\n3\n5\n7\n5"], expected: 3 }
  ],
  entrypoint: "balanced_pair_count",
  starterCode:
    "def balanced_pair_count(input_text):\n" +
    "    # Count unordered pairs of equal weights.\n" +
    "    pass\n",
  referenceCode:
    "def balanced_pair_count(input_text):\n" +
    "    counts = {}\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        value = int(line)\n" +
    "        counts[value] = counts.get(value, 0) + 1\n" +
    "    pairs = 0\n" +
    "    for count in counts.values():\n" +
    "        pairs += count * (count - 1) // 2\n" +
    "    return pairs\n",
  solutionCode:
    "from collections import Counter\n\n" +
    "def balanced_pair_count(input_text):\n" +
    "    weights = [int(t) for t in input_text.split() if t.strip()]\n" +
    "    return sum(c * (c - 1) // 2 for c in Counter(weights).values())\n",
  visibleTests: [
    { name: "three triples of fives", args: ["5\n3\n5\n7\n5"], expected: 3 },
    { name: "no duplicates", args: ["1\n2\n3"], expected: 0 },
    { name: "empty", args: [""], expected: 0 },
    { name: "all equal four", args: ["7\n7\n7\n7"], expected: 6 }
  ],
  hiddenTests: [
    { name: "single value", args: ["42"], expected: 0 },
    { name: "two pairs", args: ["1\n1\n2\n2"], expected: 2 },
    { name: "blanks skipped", args: ["\n9\n9\n\n"], expected: 1 },
    { name: "large group", args: ["3\n3\n3\n3\n3"], expected: 10 },
    { name: "mixed many groups", args: ["1\n1\n2\n2\n2\n3\n3\n3\n3"], expected: 10 },
    { name: "negative values count", args: ["-5\n-5\n-5\n5"], expected: 3 },
    { name: "zero values", args: ["0\n0\n0\n1\n2"], expected: 3 },
    { name: "two of everything", args: ["1\n1\n2\n2\n3\n3\n4\n4\n5\n5"], expected: 5 }
  ],
  hints: [
    "Group identical weights with a frequency table; each group of size n yields `n*(n-1)/2` pairs.",
    "`collections.Counter` is one line — values are counts.",
    "Walk the counter once and accumulate the pair count per group."
  ],
  solution:
    "Tally weights with a frequency dict. For each weight with count `c`, the number of pairs is `c * (c - 1) / 2`. Sum those across all distinct weights.",
  walkthrough:
    "The combinatorial identity `C(c, 2) = c*(c-1)/2` turns a pair-finding pass into pure arithmetic on counts, beating the naive O(n²) double loop.",
  complexity: { time: "O(n)", space: "O(distinct values)" },
  part2: {
    id: "part-2-triple-balance",
    title: "Part 2: Balanced triples",
    prompt:
      "Same input. Now return the number of unordered triples `(i, j, k)` with `i < j < k` such that all three weights are equal.",
    entrypoint: "balanced_triple_count",
    starterCode:
      "def balanced_triple_count(input_text):\n" +
      "    # Count unordered triples of equal weights.\n" +
      "    pass\n",
    referenceCode:
      "def balanced_triple_count(input_text):\n" +
      "    counts = {}\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        value = int(line)\n" +
      "        counts[value] = counts.get(value, 0) + 1\n" +
      "    triples = 0\n" +
      "    for count in counts.values():\n" +
      "        if count >= 3:\n" +
      "            triples += count * (count - 1) * (count - 2) // 6\n" +
      "    return triples\n",
    solutionCode:
      "from collections import Counter\n\n" +
      "def balanced_triple_count(input_text):\n" +
      "    weights = [int(t) for t in input_text.split() if t.strip()]\n" +
      "    return sum(c * (c - 1) * (c - 2) // 6 for c in Counter(weights).values() if c >= 3)\n",
    visibleTests: [
      { name: "exactly three fives", args: ["5\n3\n5\n5"], expected: 1 },
      { name: "no triples", args: ["1\n1\n2\n2"], expected: 0 },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      { name: "four equal yield four triples", args: ["7\n7\n7\n7"], expected: 4 },
      { name: "five equal yield ten triples", args: ["3\n3\n3\n3\n3"], expected: 10 },
      { name: "two groups one with triples", args: ["1\n1\n1\n2\n2\n2\n2"], expected: 5 },
      { name: "exactly two cannot triple", args: ["8\n8"], expected: 0 },
      { name: "six equal yield twenty triples", args: ["1\n1\n1\n1\n1\n1"], expected: 20 },
      { name: "scattered groups some too small", args: ["1\n1\n1\n2\n2\n3"], expected: 1 }
    ],
    hints: [
      "Reuse the frequency dict; for a count of `c`, the triple count is `c*(c-1)*(c-2)/6`.",
      "Skip counts under 3; they contribute nothing.",
      "Sum across the distinct values just like in Part 1."
    ],
    solution:
      "Same frequency tally as Part 1. For each weight with count `c >= 3`, add `c*(c-1)*(c-2)/6` to the triple count.",
    walkthrough:
      "The pattern generalizes: `C(c, k)` gives the count for any k-tuple. Skipping `c < k` is just a micro-optimization that also keeps the arithmetic clean.",
    complexity: { time: "O(n)", space: "O(distinct values)" }
  }
});

const y2d2 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d2-cipher-check",
  title: "Day 2: Cipher Check",
  difficulty: "easy",
  patterns: ["parsing", "validation"],
  prompt:
    "Each non-empty line has the shape `TYPE CODE STATUS` separated by single spaces. `TYPE` is one of `cargo`, `text`, `ledger`. `CODE` is a string of letters and digits. `STATUS` is `ok` or `bad`. A line is valid when (a) `STATUS` is `ok` and (b) `CODE` has at least one letter and at least one digit. Return the number of valid lines.",
  constraints: [
    "Lines are separated by `\\n`. Blank lines are ignored.",
    "Each non-empty line has exactly three space-separated tokens.",
    "Letters are ASCII `[a-zA-Z]`, digits are `[0-9]`.",
    "`STATUS` is exactly `ok` or `bad` (lowercase).",
    "Return 0 for empty input."
  ],
  examples: [
    {
      name: "two valid",
      args: ["cargo a1b2 ok\ntext hello bad\nledger 4242 ok\ntext h1 ok"],
      expected: 2
    }
  ],
  entrypoint: "valid_cipher_count",
  starterCode:
    "def valid_cipher_count(input_text):\n" +
    "    # Status must be ok; code must contain at least one letter and one digit.\n" +
    "    pass\n",
  referenceCode:
    "def valid_cipher_count(input_text):\n" +
    "    valid = 0\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        parts = line.split(\" \")\n" +
    "        if len(parts) != 3:\n" +
    "            continue\n" +
    "        _, code, status = parts\n" +
    "        if status != \"ok\":\n" +
    "            continue\n" +
    "        has_letter = any(c.isalpha() for c in code)\n" +
    "        has_digit = any(c.isdigit() for c in code)\n" +
    "        if has_letter and has_digit:\n" +
    "            valid += 1\n" +
    "    return valid\n",
  solutionCode:
    "def valid_cipher_count(input_text):\n" +
    "    total = 0\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        tokens = line.split()\n" +
    "        if len(tokens) != 3 or tokens[2] != \"ok\":\n" +
    "            continue\n" +
    "        code = tokens[1]\n" +
    "        if any(c.isalpha() for c in code) and any(c.isdigit() for c in code):\n" +
    "            total += 1\n" +
    "    return total\n",
  visibleTests: [
    {
      name: "mixed validity",
      args: ["cargo a1b2 ok\ntext hello bad\nledger 4242 ok\ntext h1 ok"],
      expected: 2
    },
    { name: "all bad", args: ["cargo a1 bad\ntext b2 bad"], expected: 0 },
    { name: "empty", args: [""], expected: 0 }
  ],
  hiddenTests: [
    { name: "letters only fails", args: ["cargo abcd ok"], expected: 0 },
    { name: "digits only fails", args: ["cargo 1234 ok"], expected: 0 },
    { name: "one letter one digit passes", args: ["text a1 ok"], expected: 1 },
    { name: "blank lines skipped", args: ["\ntext a1 ok\n\n"], expected: 1 },
    { name: "two-token line rejected", args: ["cargo a1"], expected: 0 },
    { name: "four-token line rejected", args: ["cargo a1 ok extra"], expected: 0 },
    { name: "uppercase ok rejected", args: ["cargo a1 OK"], expected: 0 },
    { name: "mixed valid invalid", args: ["cargo a1 ok\ntext b2 ok\nledger c3 ok\ntext bad bad"], expected: 3 }
  ],
  hints: [
    "Split each line on spaces and check token count before destructuring.",
    "`str.isalpha` and `str.isdigit` on individual characters are the simplest letter/digit tests.",
    "Status equality is exact: `status == \"ok\"` (lowercase)."
  ],
  solution:
    "Split each line into three tokens. Require status equal to `ok` and the code to contain at least one alphabetic and one numeric character. Increment a counter when both conditions hold.",
  walkthrough:
    "Two `any(...)` generator expressions read more naturally than a manual flag-tracking loop and short-circuit as soon as the predicate is satisfied.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-checksum",
    title: "Part 2: Type-specific checksum",
    prompt:
      "Same line shape and validity rule. Among the lines that pass Part 1's validity check, compute a checksum: every `cargo` line contributes the integer value of the leading run of digits in its `CODE` (e.g., `42abc` → 42; if the code starts with a letter, that line contributes 0). Every `text` line contributes the number of letters in `CODE`. Every `ledger` line contributes the sum of the digits in `CODE`. Return the total checksum.",
    entrypoint: "cipher_checksum",
    starterCode:
      "def cipher_checksum(input_text):\n" +
      "    # Checksum across valid lines using a per-type rule.\n" +
      "    pass\n",
    referenceCode:
      "def cipher_checksum(input_text):\n" +
      "    total = 0\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        parts = line.split(\" \")\n" +
      "        if len(parts) != 3:\n" +
      "            continue\n" +
      "        kind, code, status = parts\n" +
      "        if status != \"ok\":\n" +
      "            continue\n" +
      "        has_letter = any(c.isalpha() for c in code)\n" +
      "        has_digit = any(c.isdigit() for c in code)\n" +
      "        if not (has_letter and has_digit):\n" +
      "            continue\n" +
      "        if kind == \"cargo\":\n" +
      "            run = 0\n" +
      "            for ch in code:\n" +
      "                if ch.isdigit():\n" +
      "                    run = run * 10 + int(ch)\n" +
      "                else:\n" +
      "                    break\n" +
      "            total += run\n" +
      "        elif kind == \"text\":\n" +
      "            total += sum(1 for ch in code if ch.isalpha())\n" +
      "        elif kind == \"ledger\":\n" +
      "            total += sum(int(ch) for ch in code if ch.isdigit())\n" +
      "    return total\n",
    solutionCode:
      "def cipher_checksum(input_text):\n" +
      "    out = 0\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        tokens = raw.split()\n" +
      "        if len(tokens) != 3 or tokens[2] != \"ok\":\n" +
      "            continue\n" +
      "        kind, code, _ = tokens\n" +
      "        if not (any(c.isalpha() for c in code) and any(c.isdigit() for c in code)):\n" +
      "            continue\n" +
      "        if kind == \"cargo\":\n" +
      "            digits = \"\"\n" +
      "            for ch in code:\n" +
      "                if ch.isdigit():\n" +
      "                    digits += ch\n" +
      "                else:\n" +
      "                    break\n" +
      "            out += int(digits) if digits else 0\n" +
      "        elif kind == \"text\":\n" +
      "            out += sum(c.isalpha() for c in code)\n" +
      "        elif kind == \"ledger\":\n" +
      "            out += sum(int(c) for c in code if c.isdigit())\n" +
      "    return out\n",
    visibleTests: [
      {
        name: "mix all types",
        args: ["cargo 42xy ok\ntext hello1 ok\nledger 4242 bad\nledger a13 ok"],
        expected: 51
      },
      { name: "empty", args: [""], expected: 0 },
      {
        name: "ignore invalid",
        args: ["cargo abcd ok\ntext h1 ok\ntext nope bad"],
        expected: 1
      }
    ],
    hiddenTests: [
      { name: "cargo leading letter contributes zero", args: ["cargo a99 ok"], expected: 0 },
      { name: "ledger sums digits", args: ["ledger a1b2c3 ok"], expected: 6 },
      { name: "text counts letters only", args: ["text abc123def ok"], expected: 6 },
      {
        name: "mixed many lines",
        args: ["cargo 12abc ok\ntext h2llo ok\nledger 9z9 ok"],
        expected: 34
      },
      {
        name: "cargo digit run stops at first non-digit",
        args: ["cargo 7a8 ok"],
        expected: 7
      },
      {
        name: "invalid status zero contribution",
        args: ["cargo 99x bad\nledger a9 ok"],
        expected: 9
      },
      {
        name: "ledger ignores letters",
        args: ["ledger abc123 ok"],
        expected: 6
      },
      {
        name: "text ignores digits",
        args: ["text a1b2c3 ok"],
        expected: 3
      },
      {
        name: "unknown type contributes zero",
        args: ["weird a1 ok"],
        expected: 0
      }
    ],
    hints: [
      "Dispatch on `kind` only after the Part 1 validity guard passes.",
      "Cargo's rule stops at the first non-digit; build the integer with a running multiply-by-ten loop.",
      "Text and ledger reduce to simple generator-expression sums."
    ],
    solution:
      "Reuse the Part 1 validity gate. After it passes, dispatch on `kind` and apply the type-specific contribution: `cargo` reads the leading digit run, `text` counts letters, `ledger` sums digit values. Accumulate into a running total.",
    walkthrough:
      "The dispatch is the most-readable shape: an `if/elif` chain on `kind` with one expression per branch. Each rule reads as a one-liner, which is the right size for an interview whiteboard.",
    complexity: { time: "O(total characters)", space: "O(1)" }
  }
});

const y2d3 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d3-aisle-scan",
  title: "Day 3: Aisle Scan",
  difficulty: "easy",
  patterns: ["grid traversal", "step counting"],
  prompt:
    "The vault floor is a multi-line grid of cells. `.` is empty, `*` is a rare relic, `#` is a wall. Starting at row 0 column 0, walk through the grid moving one cell right per step. When you hit a wall `#` or the right edge, drop down one row and resume from column 0. Stop when there are no more rows. Count `*` cells visited. The starting cell counts if it is `*`.",
  constraints: [
    "Rows are separated by `\\n`. All rows have the same length.",
    "Cells contain only `.`, `*`, or `#`.",
    "When you stand on `#` you do not collect anything; you drop down immediately.",
    "Walking off the right edge also drops you down one row.",
    "Return 0 for an empty grid."
  ],
  examples: [
    { name: "two relics", args: [".*.\n#*.\n..*"], expected: 2 }
  ],
  entrypoint: "scan_aisle",
  starterCode:
    "def scan_aisle(input_text):\n" +
    "    # Walk right per row, drop on wall or right edge, count '*' visited.\n" +
    "    pass\n",
  referenceCode:
    "def scan_aisle(input_text):\n" +
    "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
    "    relics = 0\n" +
    "    for row in rows:\n" +
    "        for ch in row:\n" +
    "            if ch == \"#\":\n" +
    "                break\n" +
    "            if ch == \"*\":\n" +
    "                relics += 1\n" +
    "    return relics\n",
  solutionCode:
    "def scan_aisle(input_text):\n" +
    "    total = 0\n" +
    "    for row in input_text.split(\"\\n\"):\n" +
    "        if not row:\n" +
    "            continue\n" +
    "        for ch in row:\n" +
    "            if ch == \"#\":\n" +
    "                break\n" +
    "            if ch == \"*\":\n" +
    "                total += 1\n" +
    "    return total\n",
  visibleTests: [
    { name: "two relics two rows", args: [".*.\n#*.\n..*"], expected: 2 },
    { name: "empty", args: [""], expected: 0 },
    { name: "no walls", args: ["*.*\n.*."], expected: 3 },
    { name: "wall first", args: ["#**\n.**"], expected: 2 }
  ],
  hiddenTests: [
    { name: "all walls", args: ["#\n#\n#"], expected: 0 },
    { name: "single open row", args: ["**.*"], expected: 3 },
    { name: "wall mid-row stops early", args: ["**#**"], expected: 2 },
    {
      name: "many rows",
      args: ["*.*.*\n#####\n*..**\n.*.#*\n*..*."],
      expected: 9
    },
    { name: "row starting with star", args: ["*..*.."], expected: 2 },
    { name: "trailing wall after relics", args: ["**#"], expected: 2 },
    { name: "alternating relic wall rows", args: ["*\n#\n*\n#\n*"], expected: 3 },
    { name: "no relics or walls", args: ["......"], expected: 0 }
  ],
  hints: [
    "For each row, walk left-to-right and break on `#`.",
    "Reaching the row's end naturally ends the inner loop — no special edge case.",
    "Use `str.split('\\n')` and skip empty strings to handle trailing newlines."
  ],
  solution:
    "Walk each row left-to-right; break at the first wall; count `*` characters before the break. Sum the per-row counts.",
  walkthrough:
    "The grid description sounds complicated but reduces to per-row independence — no row's walk affects another. That observation collapses the implementation to two nested loops, the inner of which short-circuits cleanly on a wall.",
  complexity: { time: "O(rows * columns)", space: "O(1)" },
  part2: {
    id: "part-2-checkpoint-counts",
    title: "Part 2: Checkpoint counts",
    prompt:
      "Same grid and walking rules. Now report the number of rows whose `*` count strictly exceeded the running median of all previous rows' `*` counts (using only rows already walked). Compare each row's relic count against the median of the multiset of prior counts (use the lower of the two middle elements when the count is even). The very first row is never counted (there is no prior history). Return the count of rows that exceeded.",
    entrypoint: "scan_checkpoints",
    starterCode:
      "def scan_checkpoints(input_text):\n" +
      "    # Count rows whose '*' count strictly exceeds the running median of prior rows.\n" +
      "    pass\n",
    referenceCode:
      "def scan_checkpoints(input_text):\n" +
      "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
      "    sorted_prior = []\n" +
      "    exceeded = 0\n" +
      "    import bisect\n" +
      "    for row in rows:\n" +
      "        count = 0\n" +
      "        for ch in row:\n" +
      "            if ch == \"#\":\n" +
      "                break\n" +
      "            if ch == \"*\":\n" +
      "                count += 1\n" +
      "        if sorted_prior:\n" +
      "            median_index = (len(sorted_prior) - 1) // 2\n" +
      "            median = sorted_prior[median_index]\n" +
      "            if count > median:\n" +
      "                exceeded += 1\n" +
      "        bisect.insort(sorted_prior, count)\n" +
      "    return exceeded\n",
    solutionCode:
      "import bisect\n\n" +
      "def scan_checkpoints(input_text):\n" +
      "    rows = [r for r in input_text.split(\"\\n\") if r]\n" +
      "    prior = []\n" +
      "    out = 0\n" +
      "    for row in rows:\n" +
      "        c = 0\n" +
      "        for ch in row:\n" +
      "            if ch == \"#\":\n" +
      "                break\n" +
      "            if ch == \"*\":\n" +
      "                c += 1\n" +
      "        if prior:\n" +
      "            idx = (len(prior) - 1) // 2\n" +
      "            if c > prior[idx]:\n" +
      "                out += 1\n" +
      "        bisect.insort(prior, c)\n" +
      "    return out\n",
    visibleTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "single row never counts", args: ["*.*."], expected: 0 },
      {
        name: "second row exceeds first",
        args: ["*\n**"],
        expected: 1
      },
      {
        name: "third row matches median not exceeds",
        args: ["**\n**\n**"],
        expected: 0
      }
    ],
    hiddenTests: [
      {
        name: "increasing rows",
        args: ["*\n**\n***\n****"],
        expected: 3
      },
      {
        name: "decreasing then spike",
        args: ["****\n***\n**\n*****"],
        expected: 1
      },
      {
        name: "walls cap counts",
        args: ["**#**\n*****\n*#***\n*****"],
        expected: 2
      },
      {
        name: "all equal rows zero exceedances",
        args: ["**\n**\n**\n**\n**"],
        expected: 0
      },
      {
        name: "two rows second equal does not exceed",
        args: ["**\n**"],
        expected: 0
      },
      {
        name: "lower median tie-break for even count",
        args: ["*\n**\n***\n****\n**"],
        expected: 3
      }
    ],
    hints: [
      "Compute each row's `*` count using the Part 1 logic.",
      "Maintain a sorted list of prior counts; `bisect.insort` keeps it sorted in O(log n) lookup + O(n) shift.",
      "Take the lower median by indexing at `(len - 1) // 2`."
    ],
    solution:
      "For each row, compute its `*` count with the Part 1 walk. Compare against the lower median of the sorted list of prior counts; if strictly greater, increment the answer. Insert the count into the sorted list with `bisect.insort` and continue.",
    walkthrough:
      "The streaming median trick uses a sorted list plus binary-insertion. A two-heap variant would be O(log n) per update but a single sorted list is faster to write under interview pressure and fast enough for our row counts.",
    complexity: { time: "O(rows * (columns + rows))", space: "O(rows)" }
  }
});

const y2d4 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d4-shipment-blocks",
  title: "Day 4: Shipment Blocks",
  difficulty: "medium",
  patterns: ["multi-line records", "aggregation"],
  prompt:
    "Shipment blocks are separated by blank lines. Each non-empty line within a block has the shape `key=value` with a single equals sign. Within a block, sum the integer values of every line whose value parses as a non-negative integer (zero or positive). Ignore lines whose value is not a valid non-negative integer. Return the largest per-block sum across all blocks.",
  constraints: [
    "Blocks separated by `\\n\\n`. Lines within a block separated by `\\n`.",
    "Each non-empty line within a block has exactly one `=`.",
    "Values that fail `int(value) >= 0` are skipped; the block is not invalidated.",
    "Return 0 for an input with no blocks.",
    "If a block has zero valid lines, its contribution is 0."
  ],
  examples: [
    {
      name: "two blocks",
      args: ["a=1\nb=2\n\nc=10\nd=garbage\ne=5"],
      expected: 15
    }
  ],
  entrypoint: "max_block_sum",
  starterCode:
    "def max_block_sum(input_text):\n" +
    "    # Largest per-block sum of valid non-negative integer values.\n" +
    "    pass\n",
  referenceCode:
    "def max_block_sum(input_text):\n" +
    "    best = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        total = 0\n" +
    "        for line in block.split(\"\\n\"):\n" +
    "            line = line.strip()\n" +
    "            if not line or \"=\" not in line:\n" +
    "                continue\n" +
    "            _, value = line.split(\"=\", 1)\n" +
    "            value = value.strip()\n" +
    "            if value.isdigit():\n" +
    "                total += int(value)\n" +
    "        if total > best:\n" +
    "            best = total\n" +
    "    return best\n",
  solutionCode:
    "def max_block_sum(input_text):\n" +
    "    def parse_block(block):\n" +
    "        total = 0\n" +
    "        for raw in block.split(\"\\n\"):\n" +
    "            line = raw.strip()\n" +
    "            if \"=\" not in line:\n" +
    "                continue\n" +
    "            _, value = line.split(\"=\", 1)\n" +
    "            v = value.strip()\n" +
    "            if v.isdigit():\n" +
    "                total += int(v)\n" +
    "        return total\n" +
    "    blocks = input_text.split(\"\\n\\n\")\n" +
    "    return max((parse_block(b) for b in blocks), default=0)\n",
  visibleTests: [
    {
      name: "two blocks valid",
      args: ["a=1\nb=2\n\nc=10\nd=garbage\ne=5"],
      expected: 15
    },
    { name: "empty", args: [""], expected: 0 },
    { name: "single block", args: ["x=4\ny=8"], expected: 12 },
    { name: "negative ignored", args: ["a=-1\nb=2"], expected: 2 }
  ],
  hiddenTests: [
    { name: "all garbage", args: ["a=foo\nb=bar"], expected: 0 },
    { name: "blank block", args: ["\n\na=5\n\n\n"], expected: 5 },
    {
      name: "three blocks middle wins",
      args: ["a=1\n\na=100\nb=50\n\na=2"],
      expected: 150
    },
    { name: "zero value counted", args: ["a=0\nb=0\nc=3"], expected: 3 },
    { name: "line without equals ignored", args: ["a=10\nnopeval\nb=5"], expected: 15 },
    { name: "floats rejected as garbage", args: ["a=1.5\nb=2\nc=3"], expected: 5 },
    { name: "explicit plus sign rejected", args: ["a=+5\nb=10"], expected: 10 },
    { name: "whitespace around value tolerated", args: ["a=  7  \nb=3"], expected: 10 }
  ],
  hints: [
    "Split on `\\n\\n` to get blocks, then within each split on `\\n`.",
    "`str.isdigit` rejects negative numbers and non-numeric values in one check.",
    "Track the per-block sum and update the running maximum after each block."
  ],
  solution:
    "Walk blocks; for each, walk lines and split on the first `=`. Sum values that pass `str.isdigit`. Track the maximum sum across blocks.",
  walkthrough:
    "Splitting on `=` once with `maxsplit=1` is robust to values that happen to contain `=` (uncommon but worth noting). `str.isdigit` doubles as the non-negative-integer test because it rejects both `-1` and `1.5`.",
  complexity: { time: "O(total characters)", space: "O(1) per block" },
  part2: {
    id: "part-2-top-three",
    title: "Part 2: Top three sum",
    prompt:
      "Same parse rule. Return the sum of the three largest per-block sums. If fewer than three blocks exist, sum however many do exist.",
    entrypoint: "top_three_block_sum",
    starterCode:
      "def top_three_block_sum(input_text):\n" +
      "    # Sum of the three largest per-block sums.\n" +
      "    pass\n",
    referenceCode:
      "def top_three_block_sum(input_text):\n" +
      "    sums = []\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        total = 0\n" +
      "        for line in block.split(\"\\n\"):\n" +
      "            line = line.strip()\n" +
      "            if \"=\" not in line:\n" +
      "                continue\n" +
      "            _, value = line.split(\"=\", 1)\n" +
      "            value = value.strip()\n" +
      "            if value.isdigit():\n" +
      "                total += int(value)\n" +
      "        sums.append(total)\n" +
      "    sums.sort(reverse=True)\n" +
      "    return sum(sums[:3])\n",
    solutionCode:
      "import heapq\n\n" +
      "def top_three_block_sum(input_text):\n" +
      "    def block_total(block):\n" +
      "        s = 0\n" +
      "        for raw in block.split(\"\\n\"):\n" +
      "            line = raw.strip()\n" +
      "            if \"=\" not in line:\n" +
      "                continue\n" +
      "            _, v = line.split(\"=\", 1)\n" +
      "            v = v.strip()\n" +
      "            if v.isdigit():\n" +
      "                s += int(v)\n" +
      "        return s\n" +
      "    totals = [block_total(b) for b in input_text.split(\"\\n\\n\")]\n" +
      "    return sum(heapq.nlargest(3, totals))\n",
    visibleTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "single block", args: ["a=5"], expected: 5 },
      { name: "two blocks", args: ["a=3\n\nb=4"], expected: 7 },
      {
        name: "four blocks pick top three",
        args: ["a=1\n\nb=100\n\nc=10\n\nd=50"],
        expected: 160
      }
    ],
    hiddenTests: [
      {
        name: "five blocks",
        args: ["a=1\n\nb=2\n\nc=3\n\nd=4\n\ne=5"],
        expected: 12
      },
      { name: "three blocks", args: ["a=10\n\nb=20\n\nc=30"], expected: 60 },
      {
        name: "blocks with garbage",
        args: ["a=foo\n\nb=10\n\nc=garbage\nd=5"],
        expected: 15
      },
      {
        name: "two blocks only",
        args: ["a=50\n\nb=30"],
        expected: 80
      },
      {
        name: "ties on top do not drop",
        args: ["a=10\n\nb=10\n\nc=10\n\nd=10"],
        expected: 30
      },
      {
        name: "zero-sum blocks contribute zero",
        args: ["a=0\n\nb=0\n\nc=0\n\nd=5"],
        expected: 5
      }
    ],
    hints: [
      "Compute per-block sums into a list.",
      "`heapq.nlargest(3, sums)` returns the top three even if there are fewer than three blocks.",
      "Summing the returned list handles the \"fewer than three\" case naturally."
    ],
    solution:
      "Compute every block's sum (same as Part 1), collect into a list, then sum the three largest. `heapq.nlargest` handles both the selection and the empty/short cases without special-casing.",
    walkthrough:
      "When you only need the top-k, `heapq.nlargest` is O(n log k) versus the full sort's O(n log n). For k=3 the constant beats the asymptotic — but the function is the right reach because it documents intent.",
    complexity: { time: "O(total characters + n log 3)", space: "O(blocks)" }
  }
});

const y2d5 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d5-coordinate-codes",
  title: "Day 5: Coordinate Codes",
  difficulty: "medium",
  patterns: ["encoding", "manhattan distance"],
  prompt:
    "Each non-empty line is a coordinate code of exactly 8 characters. Every pair of characters encodes one axis step: `NN` adds (1, 0), `SS` adds (-1, 0), `EE` adds (0, 1), `WW` adds (0, -1). The starting position is (0, 0). After applying all four pairs of a code, record the final position. Return the largest Manhattan distance `|row| + |col|` among the recorded positions.",
  constraints: [
    "Each non-empty line is exactly 8 characters.",
    "Each pair is one of `NN`, `SS`, `EE`, `WW` exactly.",
    "Manhattan distance is `abs(row) + abs(col)`.",
    "Return 0 for empty input.",
    "Blank lines are ignored."
  ],
  examples: [
    { name: "two codes", args: ["NNNNEEEE\nSSSSWWWW"], expected: 4 }
  ],
  entrypoint: "max_manhattan",
  starterCode:
    "def max_manhattan(input_text):\n" +
    "    # Decode each code to a final coordinate; return max Manhattan distance.\n" +
    "    pass\n",
  referenceCode:
    "def max_manhattan(input_text):\n" +
    "    steps = {\"NN\": (1, 0), \"SS\": (-1, 0), \"EE\": (0, 1), \"WW\": (0, -1)}\n" +
    "    best = 0\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        row = 0\n" +
    "        col = 0\n" +
    "        for i in range(0, len(line), 2):\n" +
    "            pair = line[i:i + 2]\n" +
    "            dr, dc = steps[pair]\n" +
    "            row += dr\n" +
    "            col += dc\n" +
    "        distance = abs(row) + abs(col)\n" +
    "        if distance > best:\n" +
    "            best = distance\n" +
    "    return best\n",
  solutionCode:
    "def max_manhattan(input_text):\n" +
    "    moves = {\"NN\": (1, 0), \"SS\": (-1, 0), \"EE\": (0, 1), \"WW\": (0, -1)}\n" +
    "    farthest = 0\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        code = raw.strip()\n" +
    "        if not code:\n" +
    "            continue\n" +
    "        r = c = 0\n" +
    "        for i in range(0, len(code), 2):\n" +
    "            dr, dc = moves[code[i:i + 2]]\n" +
    "            r += dr\n" +
    "            c += dc\n" +
    "        d = abs(r) + abs(c)\n" +
    "        if d > farthest:\n" +
    "            farthest = d\n" +
    "    return farthest\n",
  visibleTests: [
    { name: "two opposites", args: ["NNNNEEEE\nSSSSWWWW"], expected: 4 },
    { name: "single code", args: ["NNNNNNNN"], expected: 4 },
    { name: "empty", args: [""], expected: 0 },
    { name: "cancel out", args: ["NNSSEEWW"], expected: 0 }
  ],
  hiddenTests: [
    { name: "only east", args: ["EEEEEEEE"], expected: 4 },
    { name: "mixed", args: ["NNNNEESS\nWWWWEENN"], expected: 2 },
    { name: "blank between", args: ["NNNNNNNN\n\nSSSSSSSS"], expected: 4 },
    { name: "three codes", args: ["NNEESSWW\nNNNNSSSS\nEEEEEEEE"], expected: 4 },
    { name: "north then east diagonal", args: ["NNNNEEEE"], expected: 4 },
    { name: "two codes second wins", args: ["NNSSEEWW\nNNNNEEEE"], expected: 4 },
    { name: "only south", args: ["SSSSSSSS"], expected: 4 },
    { name: "only west", args: ["WWWWWWWW"], expected: 4 }
  ],
  hints: [
    "Use a dict that maps each two-character pair to its delta vector.",
    "Iterate the line in steps of two and look up the pair in the dict.",
    "Reset row and column to zero at the start of every code."
  ],
  solution:
    "Index a delta-vector dict by the two-character pair. Walk each code two characters at a time, accumulating row and column deltas. Compute the Manhattan distance and keep the running maximum across all codes.",
  walkthrough:
    "The pair lookup is the central simplification — it turns a four-way switch into a single dict access. Stepping by 2 is the natural way to iterate a string whose unit is a pair, and `line[i:i+2]` is safe past the end because Python slices clamp.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-trajectories",
    title: "Part 2: Step-by-step max distance",
    prompt:
      "Same input. Now for each code, evaluate the Manhattan distance from the origin after every single pair (so each code produces four intermediate distances). Return the largest such distance seen across all codes and all intermediate positions, including the starting position. The starting position has distance 0.",
    entrypoint: "max_step_distance",
    starterCode:
      "def max_step_distance(input_text):\n" +
      "    # Track Manhattan distance after every pair; report the overall max.\n" +
      "    pass\n",
    referenceCode:
      "def max_step_distance(input_text):\n" +
      "    steps = {\"NN\": (1, 0), \"SS\": (-1, 0), \"EE\": (0, 1), \"WW\": (0, -1)}\n" +
      "    best = 0\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        row = 0\n" +
      "        col = 0\n" +
      "        for i in range(0, len(line), 2):\n" +
      "            dr, dc = steps[line[i:i + 2]]\n" +
      "            row += dr\n" +
      "            col += dc\n" +
      "            distance = abs(row) + abs(col)\n" +
      "            if distance > best:\n" +
      "                best = distance\n" +
      "    return best\n",
    solutionCode:
      "def max_step_distance(input_text):\n" +
      "    moves = {\"NN\": (1, 0), \"SS\": (-1, 0), \"EE\": (0, 1), \"WW\": (0, -1)}\n" +
      "    peak = 0\n" +
      "    for code in input_text.split(\"\\n\"):\n" +
      "        code = code.strip()\n" +
      "        if not code:\n" +
      "            continue\n" +
      "        r = c = 0\n" +
      "        for i in range(0, len(code), 2):\n" +
      "            dr, dc = moves[code[i:i + 2]]\n" +
      "            r += dr\n" +
      "            c += dc\n" +
      "            peak = max(peak, abs(r) + abs(c))\n" +
      "    return peak\n",
    visibleTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "single straight", args: ["NNNNNNNN"], expected: 4 },
      {
        name: "out and back",
        args: ["NNNNSSSS"],
        expected: 2
      },
      { name: "two codes", args: ["NNEESSWW\nNNNNSSSS"], expected: 2 }
    ],
    hiddenTests: [
      { name: "peak before return", args: ["NNNNNNSS"], expected: 3 },
      { name: "east then west", args: ["EEEEWWWW"], expected: 2 },
      { name: "out and back peaks at one", args: ["NNSSEEWW"], expected: 1 },
      { name: "diagonal climb peaks at end", args: ["NNNNEEEE"], expected: 4 },
      { name: "two codes second has larger intermediate peak", args: ["NNSSEEWW\nNNNNNNNN"], expected: 4 },
      { name: "S-shaped path peaks before return", args: ["NNEEEESS"], expected: 3 }
    ],
    hints: [
      "Same loop as Part 1, but update the running max after every pair, not just after the final pair.",
      "Both the starting (0, 0) position and all four intermediate positions are candidates.",
      "Reset the row/col but not the global max when starting a new code."
    ],
    solution:
      "Same as Part 1 but compute the Manhattan distance after each pair and update a running global max. The starting position contributes 0 and is implicitly considered when the running max is initialized to 0.",
    walkthrough:
      "Moving the max-check inside the inner loop is a one-line change that fundamentally changes the answer's meaning. This is the classic \"running maximum\" pattern applied to a derived quantity.",
    complexity: { time: "O(total characters)", space: "O(1)" }
  }
});

const y2d6 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d6-shelf-overlap",
  title: "Day 6: Shelf Overlap",
  difficulty: "medium",
  patterns: ["multi-line records", "set intersection"],
  prompt:
    "Records are separated by blank lines. Within a record, each non-empty line is a comma-separated list of relic IDs (e.g., `7,12,42`). Each line represents one shelf. For each record, compute the set of relic IDs that appear on every shelf (intersection across the record's lines). Sum the sizes of those per-record intersections.",
  constraints: [
    "Records separated by `\\n\\n`. Lines within a record separated by `\\n`.",
    "Each non-empty line is a comma-separated list of integers with no spaces.",
    "A record with zero non-empty lines contributes 0.",
    "Integer IDs may repeat within a single line — duplicates within a shelf count once.",
    "Return 0 for empty input."
  ],
  examples: [
    {
      name: "two records",
      args: ["1,2,3\n2,3,4\n\n5,6\n5,6,7"],
      expected: 4
    }
  ],
  entrypoint: "shelf_overlap",
  starterCode:
    "def shelf_overlap(input_text):\n" +
    "    # Sum across records of |intersection of all shelves' relic sets|.\n" +
    "    pass\n",
  referenceCode:
    "def shelf_overlap(input_text):\n" +
    "    total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        shelves = []\n" +
    "        for line in block.split(\"\\n\"):\n" +
    "            line = line.strip()\n" +
    "            if not line:\n" +
    "                continue\n" +
    "            shelves.append({int(token) for token in line.split(\",\")})\n" +
    "        if not shelves:\n" +
    "            continue\n" +
    "        common = shelves[0]\n" +
    "        for shelf in shelves[1:]:\n" +
    "            common &= shelf\n" +
    "        total += len(common)\n" +
    "    return total\n",
  solutionCode:
    "def shelf_overlap(input_text):\n" +
    "    out = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        rows = [\n" +
    "            {int(x) for x in line.split(\",\")}\n" +
    "            for line in block.split(\"\\n\")\n" +
    "            if line.strip()\n" +
    "        ]\n" +
    "        if not rows:\n" +
    "            continue\n" +
    "        common = set(rows[0])\n" +
    "        for s in rows[1:]:\n" +
    "            common &= s\n" +
    "        out += len(common)\n" +
    "    return out\n",
  visibleTests: [
    { name: "two records", args: ["1,2,3\n2,3,4\n\n5,6\n5,6,7"], expected: 4 },
    { name: "single shelf single record", args: ["1,2,3"], expected: 3 },
    { name: "empty", args: [""], expected: 0 },
    { name: "no overlap", args: ["1,2\n3,4"], expected: 0 }
  ],
  hiddenTests: [
    { name: "complete overlap three shelves", args: ["1,2\n1,2\n1,2"], expected: 2 },
    { name: "duplicate within shelf", args: ["1,1,2\n1,2,2"], expected: 2 },
    { name: "three records mixed", args: ["1,2,3\n2,3\n\n5\n5\n5\n\n9,8\n7,6"], expected: 3 },
    { name: "blank trailing block", args: ["1,2\n1,3\n\n\n"], expected: 1 }
  ],
  hints: [
    "Convert each shelf to a set of integers before any intersection.",
    "Seed the intersection with the first shelf, then `&=` each subsequent shelf.",
    "Skip records with no shelves — there is no identity set to seed from."
  ],
  solution:
    "Split into records on blank lines. For each record, parse each non-empty line into a set of integers. Reduce the sets with intersection and add the resulting size to the running total. Empty records contribute zero.",
  walkthrough:
    "Sets are the right shape — they deduplicate within shelves and reduce cleanly across them. Seeding the intersection with the first shelf (not with the full universe) avoids the question \"what does intersection-of-nothing mean.\"",
  complexity: { time: "O(total characters)", space: "O(set sizes)" },
  part2: {
    id: "part-2-unique-shelf",
    title: "Part 2: Unique to one shelf",
    prompt:
      "Same input shape. Now count, per record, the relic IDs that appear on exactly one of the record's shelves. Sum across records. As before, duplicates within a single shelf count once. A record with one shelf contributes the size of that shelf.",
    entrypoint: "shelf_unique",
    starterCode:
      "def shelf_unique(input_text):\n" +
      "    # Sum across records of |relics that appear on exactly one shelf|.\n" +
      "    pass\n",
    referenceCode:
      "def shelf_unique(input_text):\n" +
      "    total = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        counts = {}\n" +
      "        any_shelf = False\n" +
      "        for line in block.split(\"\\n\"):\n" +
      "            line = line.strip()\n" +
      "            if not line:\n" +
      "                continue\n" +
      "            any_shelf = True\n" +
      "            ids = {int(token) for token in line.split(\",\")}\n" +
      "            for relic in ids:\n" +
      "                counts[relic] = counts.get(relic, 0) + 1\n" +
      "        if not any_shelf:\n" +
      "            continue\n" +
      "        total += sum(1 for c in counts.values() if c == 1)\n" +
      "    return total\n",
    solutionCode:
      "from collections import Counter\n\n" +
      "def shelf_unique(input_text):\n" +
      "    out = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        counter = Counter()\n" +
      "        any_shelf = False\n" +
      "        for line in block.split(\"\\n\"):\n" +
      "            line = line.strip()\n" +
      "            if not line:\n" +
      "                continue\n" +
      "            any_shelf = True\n" +
      "            counter.update({int(x) for x in line.split(\",\")})\n" +
      "        if any_shelf:\n" +
      "            out += sum(1 for c in counter.values() if c == 1)\n" +
      "    return out\n",
    visibleTests: [
      { name: "two records", args: ["1,2,3\n2,3,4\n\n5,6\n5,6,7"], expected: 3 },
      { name: "single shelf", args: ["1,2,3"], expected: 3 },
      { name: "empty", args: [""], expected: 0 },
      { name: "no uniques", args: ["1,2\n1,2"], expected: 0 }
    ],
    hiddenTests: [
      { name: "three shelves one unique each", args: ["1,9\n2,9\n3,9"], expected: 3 },
      { name: "duplicate within shelf counts once", args: ["1,1,2\n2,3"], expected: 2 },
      { name: "mixed records", args: ["1,2\n1,3\n\n4,5,6\n4,5"], expected: 3 },
      { name: "every relic on every shelf", args: ["1,2,3\n1,2,3\n1,2,3"], expected: 0 }
    ],
    hints: [
      "Within each record, count how many distinct shelves each relic appears on.",
      "A relic counts as unique when its per-record count is exactly 1.",
      "Convert each shelf to a set before updating the counter so within-shelf duplicates are deduplicated."
    ],
    solution:
      "For each record, walk shelves; convert each to a set of integers; update a per-record `Counter` with that set. After processing the record, count keys whose value is exactly 1 and add to the running total.",
    walkthrough:
      "Set-then-Counter-update is the cleanest way to express \"count distinct shelves per relic.\" Filtering by `count == 1` at the end is a generator-expression one-liner.",
    complexity: { time: "O(total characters)", space: "O(distinct relics per record)" }
  }
});

const y2d7 = aocProblem({
  setId: Y2_SET_ID,
  id: "aoc-y2-d7-recipe-tree",
  title: "Day 7: Recipe Tree",
  difficulty: "medium",
  patterns: ["graph", "DFS", "memoization", "topological order"],
  prompt:
    "Each non-empty line describes one recipe in this exact shape:\n\n`RESULT requires N1 INGRED_A, N2 INGRED_B, ... .`\n\nor\n\n`RESULT requires nothing.`\n\nResult and ingredient names are single lowercase words (no spaces). Counts are positive integers. Return the number of distinct recipes (results) that transitively depend on `binding_paste` — that is, recipes that directly list `binding_paste` as an ingredient OR list any recipe that does. The starting `binding_paste` recipe is not counted as depending on itself.",
  constraints: [
    "Each rule ends with a `.`.",
    "Result and ingredient identifiers are single lowercase words; no two-word names.",
    "The empty form is exactly `RESULT requires nothing.`",
    "Counts in the body are positive integers separated from the ingredient by a single space.",
    "Return 0 if `binding_paste` never appears as an ingredient."
  ],
  examples: [
    {
      name: "two dependents",
      args: [
        "core requires 1 binding_paste.\nshell requires 1 core.\nbinding_paste requires nothing."
      ],
      expected: 2
    }
  ],
  entrypoint: "count_dependents_on_paste",
  starterCode:
    "def count_dependents_on_paste(input_text):\n" +
    "    # Count distinct recipes that transitively depend on binding_paste.\n" +
    "    pass\n",
  referenceCode:
    "import re\n\n" +
    "def count_dependents_on_paste(input_text):\n" +
    "    line_re = re.compile(r\"^(\\w+) requires (.+)\\.$\")\n" +
    "    ing_re = re.compile(r\"(\\d+) (\\w+)\")\n" +
    "    children = {}\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        m = line_re.match(line)\n" +
    "        if not m:\n" +
    "            continue\n" +
    "        result = m.group(1)\n" +
    "        body = m.group(2)\n" +
    "        if body == \"nothing\":\n" +
    "            children[result] = []\n" +
    "        else:\n" +
    "            children[result] = [name for _, name in ing_re.findall(body)]\n" +
    "    parents = {}\n" +
    "    for parent, kids in children.items():\n" +
    "        for kid in kids:\n" +
    "            parents.setdefault(kid, []).append(parent)\n" +
    "    visited = set()\n" +
    "    stack = list(parents.get(\"binding_paste\", []))\n" +
    "    while stack:\n" +
    "        node = stack.pop()\n" +
    "        if node in visited:\n" +
    "            continue\n" +
    "        visited.add(node)\n" +
    "        stack.extend(parents.get(node, []))\n" +
    "    return len(visited)\n",
  solutionCode:
    "import re\n\n" +
    "def count_dependents_on_paste(input_text):\n" +
    "    rule_re = re.compile(r\"^(\\w+) requires (.+)\\.$\")\n" +
    "    ing_re = re.compile(r\"(\\d+) (\\w+)\")\n" +
    "    parents_of = {}\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        m = rule_re.match(line)\n" +
    "        if not m:\n" +
    "            continue\n" +
    "        parent, body = m.group(1), m.group(2)\n" +
    "        if body == \"nothing\":\n" +
    "            continue\n" +
    "        for _, child in ing_re.findall(body):\n" +
    "            parents_of.setdefault(child, set()).add(parent)\n" +
    "    seen = set()\n" +
    "    stack = list(parents_of.get(\"binding_paste\", set()))\n" +
    "    while stack:\n" +
    "        node = stack.pop()\n" +
    "        if node in seen:\n" +
    "            continue\n" +
    "        seen.add(node)\n" +
    "        stack.extend(parents_of.get(node, ()))\n" +
    "    return len(seen)\n",
  visibleTests: [
    {
      name: "two dependents",
      args: ["core requires 1 binding_paste.\nshell requires 1 core.\nbinding_paste requires nothing."],
      expected: 2
    },
    {
      name: "no dependents",
      args: ["alpha requires 1 beta.\nbeta requires nothing."],
      expected: 0
    },
    { name: "empty", args: [""], expected: 0 }
  ],
  hiddenTests: [
    {
      name: "diamond dependents",
      args: [
        "left requires 1 binding_paste.\nright requires 1 binding_paste.\ntop requires 1 left, 1 right.\nbinding_paste requires nothing."
      ],
      expected: 3
    },
    {
      name: "long chain",
      args: [
        "a requires 1 binding_paste.\nb requires 1 a.\nc requires 1 b.\nd requires 1 c.\nbinding_paste requires nothing."
      ],
      expected: 4
    },
    {
      name: "irrelevant subtree",
      args: [
        "core requires 1 binding_paste.\nirrelevant requires 1 dust.\ndust requires nothing.\nbinding_paste requires nothing."
      ],
      expected: 1
    }
  ],
  hints: [
    "Build the directed dependency graph from each rule (parent depends on children).",
    "Invert the graph to get a `child -> parents` map.",
    "Flood-fill from `binding_paste` along the inverted edges and count distinct visited nodes."
  ],
  solution:
    "Parse each rule into a (result, list-of-ingredients) pair. Build an inverted map from child to parents. Flood-fill from `binding_paste` along this map; the size of the visited set excluding the start is the answer.",
  walkthrough:
    "Identical pattern to Year 1 Day 7 with single-word identifiers. The flip from forward to reverse adjacency turns the question into a textbook reachability problem on the reversed graph.",
  complexity: { time: "O(rules + edges)", space: "O(nodes)" },
  part2: {
    id: "part-2-paste-cost",
    title: "Part 2: Paste cost",
    prompt:
      "Same input. Now compute the total quantity of `binding_paste` required to produce exactly one unit of the recipe named `final_product`. Direct dependencies multiply through the chain (e.g., 2 of X, and X needs 3 binding_paste each, contributes 6). If `final_product` is not defined in the input, return 0. If `final_product` does not transitively need `binding_paste`, return 0.",
    entrypoint: "binding_paste_cost",
    starterCode:
      "def binding_paste_cost(input_text):\n" +
      "    # Total binding_paste needed to produce 1 unit of 'final_product'.\n" +
      "    pass\n",
    referenceCode:
      "import re\n\n" +
      "def binding_paste_cost(input_text):\n" +
      "    line_re = re.compile(r\"^(\\w+) requires (.+)\\.$\")\n" +
      "    ing_re = re.compile(r\"(\\d+) (\\w+)\")\n" +
      "    children = {}\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        m = line_re.match(line)\n" +
      "        if not m:\n" +
      "            continue\n" +
      "        result = m.group(1)\n" +
      "        body = m.group(2)\n" +
      "        if body == \"nothing\":\n" +
      "            children[result] = []\n" +
      "        else:\n" +
      "            children[result] = [(int(c), name) for c, name in ing_re.findall(body)]\n" +
      "    if \"final_product\" not in children:\n" +
      "        return 0\n" +
      "    memo = {}\n" +
      "    def cost(node):\n" +
      "        if node == \"binding_paste\":\n" +
      "            return 1\n" +
      "        if node in memo:\n" +
      "            return memo[node]\n" +
      "        total = 0\n" +
      "        for amount, child in children.get(node, []):\n" +
      "            total += amount * cost(child)\n" +
      "        memo[node] = total\n" +
      "        return total\n" +
      "    return cost(\"final_product\")\n",
    solutionCode:
      "import re\n" +
      "from functools import lru_cache\n\n" +
      "def binding_paste_cost(input_text):\n" +
      "    rule_re = re.compile(r\"^(\\w+) requires (.+)\\.$\")\n" +
      "    ing_re = re.compile(r\"(\\d+) (\\w+)\")\n" +
      "    deps = {}\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        m = rule_re.match(line)\n" +
      "        if not m:\n" +
      "            continue\n" +
      "        result, body = m.group(1), m.group(2)\n" +
      "        deps[result] = ([] if body == \"nothing\"\n" +
      "                        else [(int(c), n) for c, n in ing_re.findall(body)])\n" +
      "    if \"final_product\" not in deps:\n" +
      "        return 0\n" +
      "\n" +
      "    @lru_cache(maxsize=None)\n" +
      "    def cost(node):\n" +
      "        if node == \"binding_paste\":\n" +
      "            return 1\n" +
      "        return sum(amount * cost(child) for amount, child in deps.get(node, []))\n" +
      "\n" +
      "    return cost(\"final_product\")\n",
    visibleTests: [
      {
        name: "direct cost",
        args: ["final_product requires 3 binding_paste.\nbinding_paste requires nothing."],
        expected: 3
      },
      {
        name: "indirect cost",
        args: [
          "final_product requires 2 core.\ncore requires 5 binding_paste.\nbinding_paste requires nothing."
        ],
        expected: 10
      },
      { name: "empty", args: [""], expected: 0 }
    ],
    hiddenTests: [
      {
        name: "no paste needed",
        args: ["final_product requires 1 dust.\ndust requires nothing.\nbinding_paste requires nothing."],
        expected: 0
      },
      {
        name: "diamond multiplies twice",
        args: [
          "final_product requires 2 left, 3 right.\nleft requires 1 binding_paste.\nright requires 4 binding_paste.\nbinding_paste requires nothing."
        ],
        expected: 14
      },
      {
        name: "long chain",
        args: [
          "final_product requires 2 a.\na requires 3 b.\nb requires 5 binding_paste.\nbinding_paste requires nothing."
        ],
        expected: 30
      }
    ],
    hints: [
      "Compute `cost(node)` recursively: cost of `binding_paste` is 1, cost of anything else is the multiplicative sum across its dependencies.",
      "Memoize to avoid recomputing shared subtrees (diamonds amplify the speedup).",
      "Return 0 when `final_product` is not defined."
    ],
    solution:
      "Parse rules into a `result -> list of (count, ingredient)` map. Define `cost(node)`: 1 for `binding_paste`, otherwise the sum over its dependencies of `count * cost(ingredient)`. Memoize. Return `cost('final_product')`.",
    walkthrough:
      "Same multiplicative-DP recurrence as Year 1 Day 7 Part 2; the base case here is `binding_paste = 1` rather than \"leaf = 0\", which makes the recursion express the question \"how much paste\" directly.",
    complexity: { time: "O(nodes + edges)", space: "O(nodes)" }
  }
});

const yearTwo: ProblemSet = {
  id: Y2_SET_ID,
  title: "Year Two: Vault Inventory",
  summary: "Seven AoC-shaped exercises with a different problem at each rung: pair-counting via combinatorics, type dispatch, running medians, and recipe DAGs.",
  intro:
    "Same shape as Year One — one string in, one answer out, Part 2 extends Part 1. The puzzles differ enough from Year One that you cannot rely on muscle memory; the day-by-day difficulty ramp is preserved so each session matches the difficulty of an AoC day 1 → day 7 sweep.",
  problems: [y2d1, y2d2, y2d3, y2d4, y2d5, y2d6, y2d7]
};

// ============================================================================
// YEAR 3 — Festival Logistics (planning a multi-day event)
// ============================================================================

const Y3_SET_ID = "aoc-year-3";

const y3d1 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d1-revenue-window",
  title: "Day 1: Revenue Window",
  difficulty: "warmup",
  patterns: ["parsing", "sliding window", "max"],
  prompt:
    "The input is one integer revenue figure per non-empty line. The first non-empty line is the window size `k`. Every following non-empty line is one day's revenue. Return the maximum sum of any contiguous window of exactly `k` consecutive days. Return 0 if fewer than `k` days are present.",
  constraints: [
    "First non-empty line is a positive integer `k`.",
    "Following lines are integers (positive, negative, or zero).",
    "A window is exactly `k` consecutive days — no shorter, no longer.",
    "Blank lines are skipped.",
    "Return 0 if the day count is below `k`."
  ],
  examples: [
    { name: "best window of three", args: ["3\n1\n2\n3\n4\n5"], expected: 12 }
  ],
  entrypoint: "max_revenue_window",
  starterCode:
    "def max_revenue_window(input_text):\n" +
    "    # First non-empty line is the window size k; rest are daily revenues.\n" +
    "    pass\n",
  referenceCode:
    "def max_revenue_window(input_text):\n" +
    "    lines = [line for line in input_text.split(\"\\n\") if line.strip()]\n" +
    "    if not lines:\n" +
    "        return 0\n" +
    "    k = int(lines[0])\n" +
    "    days = [int(line) for line in lines[1:]]\n" +
    "    if len(days) < k:\n" +
    "        return 0\n" +
    "    current = sum(days[:k])\n" +
    "    best = current\n" +
    "    for i in range(k, len(days)):\n" +
    "        current += days[i] - days[i - k]\n" +
    "        if current > best:\n" +
    "            best = current\n" +
    "    return best\n",
  solutionCode:
    "def max_revenue_window(input_text):\n" +
    "    parts = [p for p in input_text.split(\"\\n\") if p.strip()]\n" +
    "    if not parts:\n" +
    "        return 0\n" +
    "    k = int(parts[0])\n" +
    "    nums = [int(x) for x in parts[1:]]\n" +
    "    if len(nums) < k:\n" +
    "        return 0\n" +
    "    window = sum(nums[:k])\n" +
    "    peak = window\n" +
    "    for i in range(k, len(nums)):\n" +
    "        window += nums[i] - nums[i - k]\n" +
    "        if window > peak:\n" +
    "            peak = window\n" +
    "    return peak\n",
  visibleTests: [
    { name: "best window of three", args: ["3\n1\n2\n3\n4\n5"], expected: 12 },
    { name: "single day window", args: ["1\n5\n9\n3"], expected: 9 },
    { name: "empty", args: [""], expected: 0 },
    { name: "fewer days than k", args: ["5\n1\n2"], expected: 0 }
  ],
  hiddenTests: [
    { name: "negative values", args: ["2\n-1\n-2\n-3\n10"], expected: 7 },
    { name: "exact fit", args: ["3\n1\n2\n3"], expected: 6 },
    { name: "zeros around peak", args: ["2\n0\n5\n5\n0"], expected: 10 },
    { name: "all negative", args: ["2\n-5\n-3\n-9\n-1"], expected: -8 }
  ],
  hints: [
    "Compute the first window's sum, then slide: subtract the leaving day and add the entering day.",
    "Initialize `best` to the first window's sum so the first comparison is meaningful.",
    "Bail out when the day count is below `k`."
  ],
  solution:
    "Parse `k` and the daily values. Compute the initial window sum over the first `k` days, then slide one day at a time: subtract `days[i - k]` and add `days[i]`. Track the running maximum.",
  walkthrough:
    "The sliding-window technique replaces a quadratic recompute with a constant-per-step update. The first window is the seed; subsequent windows differ by exactly two terms.",
  complexity: { time: "O(n)", space: "O(n)" },
  part2: {
    id: "part-2-count-good-windows",
    title: "Part 2: Count winning windows",
    prompt:
      "Same input. Now return the count of windows of size `k` whose sum is strictly greater than the sum of the immediately previous window of size `k`. The first window has no previous window and is never counted.",
    entrypoint: "rising_windows",
    starterCode:
      "def rising_windows(input_text):\n" +
      "    # Count consecutive k-windows whose sum exceeds the previous k-window's sum.\n" +
      "    pass\n",
    referenceCode:
      "def rising_windows(input_text):\n" +
      "    lines = [line for line in input_text.split(\"\\n\") if line.strip()]\n" +
      "    if not lines:\n" +
      "        return 0\n" +
      "    k = int(lines[0])\n" +
      "    days = [int(line) for line in lines[1:]]\n" +
      "    if len(days) <= k:\n" +
      "        return 0\n" +
      "    prev_sum = sum(days[:k])\n" +
      "    rising = 0\n" +
      "    for i in range(k, len(days)):\n" +
      "        new_sum = prev_sum + days[i] - days[i - k]\n" +
      "        if new_sum > prev_sum:\n" +
      "            rising += 1\n" +
      "        prev_sum = new_sum\n" +
      "    return rising\n",
    solutionCode:
      "def rising_windows(input_text):\n" +
      "    parts = [p for p in input_text.split(\"\\n\") if p.strip()]\n" +
      "    if not parts:\n" +
      "        return 0\n" +
      "    k = int(parts[0])\n" +
      "    nums = [int(x) for x in parts[1:]]\n" +
      "    if len(nums) <= k:\n" +
      "        return 0\n" +
      "    prev = sum(nums[:k])\n" +
      "    out = 0\n" +
      "    for i in range(k, len(nums)):\n" +
      "        cur = prev + nums[i] - nums[i - k]\n" +
      "        if cur > prev:\n" +
      "            out += 1\n" +
      "        prev = cur\n" +
      "    return out\n",
    visibleTests: [
      { name: "increasing days", args: ["3\n1\n2\n3\n4\n5"], expected: 2 },
      { name: "no rises", args: ["2\n5\n5\n5\n5"], expected: 0 },
      { name: "empty", args: [""], expected: 0 },
      { name: "exact fit no second window", args: ["3\n1\n2\n3"], expected: 0 }
    ],
    hiddenTests: [
      { name: "noisy rise", args: ["2\n1\n2\n0\n5"], expected: 1 },
      { name: "always falling", args: ["1\n5\n4\n3\n2"], expected: 0 },
      { name: "all equal", args: ["3\n3\n3\n3\n3\n3"], expected: 0 },
      { name: "negatives still rise", args: ["2\n-10\n0\n5\n-1"], expected: 1 }
    ],
    hints: [
      "Slide the window the same way Part 1 does and compare each new sum to the previous one.",
      "Track only `prev_sum` plus a counter — no need to store every window.",
      "The first window seeds `prev_sum`; the loop starts at index `k`."
    ],
    solution:
      "Compute the first window sum to seed `prev_sum`. Slide the window from index `k` onward: compute the new sum from `prev_sum`, compare to `prev_sum`, increment a counter on strict increase, then update `prev_sum`.",
    walkthrough:
      "This is the same sliding-window machinery as Part 1 with the maximization replaced by a delta-counter. Comparing consecutive windows is exactly the classic \"how many measurements increased\" pattern.",
    complexity: { time: "O(n)", space: "O(n)" }
  }
});

const y3d2 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d2-permit-validation",
  title: "Day 2: Permit Validation",
  difficulty: "easy",
  patterns: ["parsing", "validation", "format check"],
  prompt:
    "Each non-empty line has the shape `STAGE LICENSE EXPIRES` (three space-separated tokens). `STAGE` is one of `main`, `side`, `late`. `LICENSE` is a string of digits and hyphens; valid licenses are exactly the pattern `NNN-NN-NNNN` (three digits, hyphen, two digits, hyphen, four digits — eleven characters total). `EXPIRES` is a four-digit year. A permit is valid when (a) the license matches the strict pattern and (b) `EXPIRES` is at least 2025. Return the count of valid permits.",
  constraints: [
    "Lines are separated by `\\n`. Blank lines are ignored.",
    "Each non-empty line has exactly three space-separated tokens.",
    "License length is exactly 11 if valid; hyphens are at positions 3 and 6 (0-indexed).",
    "EXPIRES is exactly 4 digits.",
    "Return 0 for empty input."
  ],
  examples: [
    {
      name: "two valid",
      args: ["main 123-45-6789 2026\nside abc 2030\nlate 987-65-4321 2024\nlate 111-22-3333 2025"],
      expected: 2
    }
  ],
  entrypoint: "count_valid_permits",
  starterCode:
    "def count_valid_permits(input_text):\n" +
    "    # Validate license format and expiry; count valid permits.\n" +
    "    pass\n",
  referenceCode:
    "def count_valid_permits(input_text):\n" +
    "    valid = 0\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        parts = line.split(\" \")\n" +
    "        if len(parts) != 3:\n" +
    "            continue\n" +
    "        _, license_value, expires = parts\n" +
    "        if len(license_value) != 11 or license_value[3] != \"-\" or license_value[6] != \"-\":\n" +
    "            continue\n" +
    "        groups = license_value.split(\"-\")\n" +
    "        if len(groups) != 3 or not (groups[0].isdigit() and groups[1].isdigit() and groups[2].isdigit()):\n" +
    "            continue\n" +
    "        if (len(groups[0]), len(groups[1]), len(groups[2])) != (3, 2, 4):\n" +
    "            continue\n" +
    "        if not (expires.isdigit() and len(expires) == 4 and int(expires) >= 2025):\n" +
    "            continue\n" +
    "        valid += 1\n" +
    "    return valid\n",
  solutionCode:
    "import re\n\n" +
    "_LICENSE = re.compile(r\"^\\d{3}-\\d{2}-\\d{4}$\")\n\n" +
    "def count_valid_permits(input_text):\n" +
    "    total = 0\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        tokens = raw.split()\n" +
    "        if len(tokens) != 3:\n" +
    "            continue\n" +
    "        _, license_value, expires = tokens\n" +
    "        if not _LICENSE.match(license_value):\n" +
    "            continue\n" +
    "        if not expires.isdigit() or len(expires) != 4 or int(expires) < 2025:\n" +
    "            continue\n" +
    "        total += 1\n" +
    "    return total\n",
  visibleTests: [
    {
      name: "two valid two invalid",
      args: ["main 123-45-6789 2026\nside abc 2030\nlate 987-65-4321 2024\nlate 111-22-3333 2025"],
      expected: 2
    },
    { name: "empty", args: [""], expected: 0 },
    { name: "all expired", args: ["main 111-22-3333 2020\nside 444-55-6666 2010"], expected: 0 },
    { name: "all valid", args: ["main 111-22-3333 2025\nside 444-55-6666 2030"], expected: 2 }
  ],
  hiddenTests: [
    { name: "wrong group length", args: ["main 12-45-6789 2030"], expected: 0 },
    { name: "missing hyphen", args: ["main 123456789 2030"], expected: 0 },
    { name: "expires too short", args: ["main 123-45-6789 999"], expected: 0 },
    { name: "exact 2025 cutoff", args: ["main 123-45-6789 2025"], expected: 1 }
  ],
  hints: [
    "Use a regex to express the license shape — `\\d{3}-\\d{2}-\\d{4}` anchored — or split on `-` and check group lengths.",
    "Validate the expiry independently: must be four digits and at least 2025.",
    "Use guard clauses so each rule can fail fast without nesting."
  ],
  solution:
    "Split each non-empty line into three tokens. Match the license against the anchored pattern `\\d{3}-\\d{2}-\\d{4}`. Check that the expiry is four digits and `>= 2025`. Count lines that pass both gates.",
  walkthrough:
    "The regex is the right reach here because the pattern has multiple constraints (lengths AND digit-ness AND hyphen positions) that fold into one expression. The non-regex variant is also correct; both are interview-acceptable.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-permit-summary",
    title: "Part 2: Permits per stage",
    prompt:
      "Same line shape and validity rule. Now return a dict mapping each stage (`main`, `side`, `late`) to the number of valid permits in that stage. Stages with zero valid permits should still appear in the dict with value `0`.",
    entrypoint: "permit_counts_by_stage",
    starterCode:
      "def permit_counts_by_stage(input_text):\n" +
      "    # Return {'main': n1, 'side': n2, 'late': n3} of valid permits per stage.\n" +
      "    pass\n",
    referenceCode:
      "def permit_counts_by_stage(input_text):\n" +
      "    out = {\"main\": 0, \"side\": 0, \"late\": 0}\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        parts = line.split(\" \")\n" +
      "        if len(parts) != 3:\n" +
      "            continue\n" +
      "        stage, license_value, expires = parts\n" +
      "        if stage not in out:\n" +
      "            continue\n" +
      "        if len(license_value) != 11 or license_value[3] != \"-\" or license_value[6] != \"-\":\n" +
      "            continue\n" +
      "        groups = license_value.split(\"-\")\n" +
      "        if (len(groups[0]), len(groups[1]), len(groups[2])) != (3, 2, 4):\n" +
      "            continue\n" +
      "        if not all(g.isdigit() for g in groups):\n" +
      "            continue\n" +
      "        if not (expires.isdigit() and len(expires) == 4 and int(expires) >= 2025):\n" +
      "            continue\n" +
      "        out[stage] += 1\n" +
      "    return out\n",
    solutionCode:
      "import re\n\n" +
      "_RX = re.compile(r\"^\\d{3}-\\d{2}-\\d{4}$\")\n\n" +
      "def permit_counts_by_stage(input_text):\n" +
      "    counts = {\"main\": 0, \"side\": 0, \"late\": 0}\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        tokens = raw.split()\n" +
      "        if len(tokens) != 3:\n" +
      "            continue\n" +
      "        stage, lic, exp = tokens\n" +
      "        if stage not in counts:\n" +
      "            continue\n" +
      "        if not _RX.match(lic):\n" +
      "            continue\n" +
      "        if not exp.isdigit() or len(exp) != 4 or int(exp) < 2025:\n" +
      "            continue\n" +
      "        counts[stage] += 1\n" +
      "    return counts\n",
    visibleTests: [
      {
        name: "mixed stages",
        args: ["main 111-22-3333 2026\nside 444-55-6666 2027\nside 444-55-6666 2020"],
        expected: { main: 1, side: 1, late: 0 }
      },
      {
        name: "empty",
        args: [""],
        expected: { main: 0, side: 0, late: 0 }
      },
      {
        name: "all main",
        args: ["main 111-22-3333 2025\nmain 222-33-4444 2030"],
        expected: { main: 2, side: 0, late: 0 }
      }
    ],
    hiddenTests: [
      {
        name: "unknown stage ignored",
        args: ["spare 111-22-3333 2030\nmain 111-22-3333 2030"],
        expected: { main: 1, side: 0, late: 0 }
      },
      {
        name: "invalid license still counted by stage zero",
        args: ["late abc 2030"],
        expected: { main: 0, side: 0, late: 0 }
      },
      {
        name: "all three stages",
        args: [
          "main 111-22-3333 2025\nside 444-55-6666 2026\nlate 777-88-9999 2027"
        ],
        expected: { main: 1, side: 1, late: 1 }
      }
    ],
    hints: [
      "Initialize the output dict with all three stages mapped to 0 so they show up even when empty.",
      "Reuse the Part 1 validity gate; the only change is to bump the per-stage counter instead of a global one.",
      "Reject unknown stage names by checking membership in the output dict."
    ],
    solution:
      "Seed the output dict with `main`, `side`, `late` all at zero. For each line that passes the validity gate AND has a known stage, increment that stage's count. Return the seeded dict so empty stages are visible.",
    walkthrough:
      "Seeding the dict (rather than `setdefault` or `defaultdict`) preserves the \"empty stage is still a key\" contract the prompt requires — a useful interview tic when the caller needs a stable schema.",
    complexity: { time: "O(total characters)", space: "O(1)" }
  }
});

const y3d3 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d3-stage-paths",
  title: "Day 3: Stage Paths",
  difficulty: "easy",
  patterns: ["grid traversal", "step counting"],
  prompt:
    "The festival map is a multi-line grid. `.` is open, `T` is a stagehand, `#` is a barrier. From row 0 column 0, take exactly one step right and one step down per move (a diagonal step). If the new cell is a barrier `#`, the move fails and you stay; the walk ends. Otherwise count `T` if landed on, then continue. The walk also ends when you fall off the grid. Return the number of `T` cells collected. The starting cell counts if it is `T`.",
  constraints: [
    "Rows have equal length and are separated by `\\n`.",
    "Cells are `.`, `T`, or `#`.",
    "Each move is exactly +1 row and +1 column.",
    "The walk halts on the first barrier hit OR when the next position is off-grid.",
    "Return 0 for an empty grid."
  ],
  examples: [
    { name: "three diagonals", args: ["T..\n.T.\n..T"], expected: 3 }
  ],
  entrypoint: "diagonal_count",
  starterCode:
    "def diagonal_count(input_text):\n" +
    "    # Walk (+1, +1) from origin; stop at barriers or off-grid; count 'T' visited.\n" +
    "    pass\n",
  referenceCode:
    "def diagonal_count(input_text):\n" +
    "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
    "    if not rows:\n" +
    "        return 0\n" +
    "    width = len(rows[0])\n" +
    "    r = 0\n" +
    "    c = 0\n" +
    "    count = 0\n" +
    "    while r < len(rows) and c < width:\n" +
    "        cell = rows[r][c]\n" +
    "        if cell == \"#\":\n" +
    "            break\n" +
    "        if cell == \"T\":\n" +
    "            count += 1\n" +
    "        r += 1\n" +
    "        c += 1\n" +
    "    return count\n",
  solutionCode:
    "def diagonal_count(input_text):\n" +
    "    grid = [r for r in input_text.split(\"\\n\") if r]\n" +
    "    if not grid:\n" +
    "        return 0\n" +
    "    w = len(grid[0])\n" +
    "    visited = 0\n" +
    "    step = 0\n" +
    "    while step < len(grid) and step < w:\n" +
    "        ch = grid[step][step]\n" +
    "        if ch == \"#\":\n" +
    "            break\n" +
    "        if ch == \"T\":\n" +
    "            visited += 1\n" +
    "        step += 1\n" +
    "    return visited\n",
  visibleTests: [
    { name: "three diagonals", args: ["T..\n.T.\n..T"], expected: 3 },
    { name: "barrier stops early", args: ["T..\n.#.\n..T"], expected: 1 },
    { name: "empty", args: [""], expected: 0 },
    { name: "no T", args: ["...\n...\n..."], expected: 0 }
  ],
  hiddenTests: [
    { name: "non-square wide", args: ["T...\n.T..\n..T."], expected: 3 },
    { name: "non-square tall", args: ["T..\n.T.\n..T\n..."], expected: 3 },
    { name: "barrier at start", args: ["#TT\nTTT\nTTT"], expected: 0 },
    { name: "first cell stagehand", args: ["T...\n....\n....\n...."], expected: 1 }
  ],
  hints: [
    "The diagonal step always increments both `r` and `c` by 1 — track a single step counter.",
    "The walk ends on barrier OR when the step counter equals the smaller of width and height.",
    "Skip empty rows when splitting so the width is computed from real content."
  ],
  solution:
    "Walk while `step < min(rows, width)`. Read `grid[step][step]`; break on `#`; increment count on `T`. Stop naturally when the step counter falls off the grid.",
  walkthrough:
    "Diagonal walking collapses to a one-counter loop. Non-square grids end the walk via whichever dimension runs out first.",
  complexity: { time: "O(min(rows, columns))", space: "O(rows)" },
  part2: {
    id: "part-2-three-paths",
    title: "Part 2: Three diagonal paths",
    prompt:
      "Now walk three different diagonals from row 0 column 0: `(+1, +1)`, `(+1, +2)`, `(+2, +1)`. Each path collects `T` cells under the same rules (barriers stop, off-grid stops). Return the sum of the three counts. Each path is independent.",
    entrypoint: "three_paths_sum",
    starterCode:
      "def three_paths_sum(input_text):\n" +
      "    # Sum the T counts from three (dr, dc) walks: (1,1), (1,2), (2,1).\n" +
      "    pass\n",
    referenceCode:
      "def three_paths_sum(input_text):\n" +
      "    rows = [line for line in input_text.split(\"\\n\") if line]\n" +
      "    if not rows:\n" +
      "        return 0\n" +
      "    width = len(rows[0])\n" +
      "    total = 0\n" +
      "    for dr, dc in [(1, 1), (1, 2), (2, 1)]:\n" +
      "        r = 0\n" +
      "        c = 0\n" +
      "        while r < len(rows) and c < width:\n" +
      "            cell = rows[r][c]\n" +
      "            if cell == \"#\":\n" +
      "                break\n" +
      "            if cell == \"T\":\n" +
      "                total += 1\n" +
      "            r += dr\n" +
      "            c += dc\n" +
      "    return total\n",
    solutionCode:
      "def three_paths_sum(input_text):\n" +
      "    grid = [r for r in input_text.split(\"\\n\") if r]\n" +
      "    if not grid:\n" +
      "        return 0\n" +
      "    w = len(grid[0])\n" +
      "    h = len(grid)\n" +
      "    total = 0\n" +
      "    for dr, dc in ((1, 1), (1, 2), (2, 1)):\n" +
      "        r = c = 0\n" +
      "        while r < h and c < w:\n" +
      "            ch = grid[r][c]\n" +
      "            if ch == \"#\":\n" +
      "                break\n" +
      "            if ch == \"T\":\n" +
      "                total += 1\n" +
      "            r += dr\n" +
      "            c += dc\n" +
      "    return total\n",
    visibleTests: [
      { name: "small grid", args: ["T..\n.T.\n..T"], expected: 5 },
      { name: "empty", args: [""], expected: 0 },
      { name: "no T", args: ["...\n...\n..."], expected: 0 },
      { name: "all T", args: ["TT\nTT\nTT"], expected: 5 }
    ],
    hiddenTests: [
      {
        name: "wide grid",
        args: ["T.T.T\n.T.T.\nT.T.T"],
        expected: 6
      },
      { name: "barrier blocks one path", args: ["T..\n.#.\n..T"], expected: 3 },
      { name: "tall grid", args: ["T.\n.T\nT.\n.T\nT."], expected: 4 }
    ],
    hints: [
      "Pull the single-path walk out and call it three times with different (dr, dc) pairs.",
      "Use a `while r < h and c < w` guard so different step sizes terminate correctly.",
      "Sum the per-path counts at the end."
    ],
    solution:
      "Run the Part 1 diagonal-walk routine three times with steps `(1, 1)`, `(1, 2)`, `(2, 1)` and sum the per-walk counts. The walk's termination condition handles each step size automatically.",
    walkthrough:
      "Parameterizing the step lets the same loop drive every path. The (1, 2) and (2, 1) variants terminate earlier because they consume one dimension faster, so paths are short.",
    complexity: { time: "O(min(rows, columns))", space: "O(rows)" }
  }
});

const y3d4 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d4-vendor-rosters",
  title: "Day 4: Vendor Rosters",
  difficulty: "medium",
  patterns: ["multi-line records", "validation", "category aggregation"],
  prompt:
    "Vendor rosters are separated by blank lines. Each non-empty line in a roster has the shape `category:items` where `items` is a comma-separated list of item names (one or more items, no spaces inside names). A roster is valid only when it contains all three categories `food`, `craft`, and `music`. For each valid roster, the score is the total number of items across all its lines (so duplicates across categories or within a single line count toward the total). Return the sum of scores across valid rosters.",
  constraints: [
    "Rosters separated by `\\n\\n`. Lines within a roster separated by `\\n`.",
    "Each non-empty line has exactly one colon separating category and items.",
    "Items are non-empty strings separated by single commas.",
    "Required categories: `food`, `craft`, `music`. Additional categories are allowed and counted.",
    "Return 0 for empty input."
  ],
  examples: [
    {
      name: "one valid roster",
      args: ["food:taco,burrito\ncraft:pottery\nmusic:drum,flute,harp"],
      expected: 6
    }
  ],
  entrypoint: "valid_roster_total",
  starterCode:
    "def valid_roster_total(input_text):\n" +
    "    # Sum item counts across rosters that have all three required categories.\n" +
    "    pass\n",
  referenceCode:
    "def valid_roster_total(input_text):\n" +
    "    required = {\"food\", \"craft\", \"music\"}\n" +
    "    total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        categories = set()\n" +
    "        item_count = 0\n" +
    "        for line in block.split(\"\\n\"):\n" +
    "            line = line.strip()\n" +
    "            if \":\" not in line:\n" +
    "                continue\n" +
    "            category, items = line.split(\":\", 1)\n" +
    "            categories.add(category)\n" +
    "            item_count += len(items.split(\",\"))\n" +
    "        if required <= categories:\n" +
    "            total += item_count\n" +
    "    return total\n",
  solutionCode:
    "def valid_roster_total(input_text):\n" +
    "    needed = {\"food\", \"craft\", \"music\"}\n" +
    "    out = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        cats = set()\n" +
    "        items = 0\n" +
    "        for raw in block.split(\"\\n\"):\n" +
    "            line = raw.strip()\n" +
    "            if \":\" not in line:\n" +
    "                continue\n" +
    "            cat, body = line.split(\":\", 1)\n" +
    "            cats.add(cat)\n" +
    "            items += len(body.split(\",\"))\n" +
    "        if needed.issubset(cats):\n" +
    "            out += items\n" +
    "    return out\n",
  visibleTests: [
    {
      name: "one valid roster",
      args: ["food:taco,burrito\ncraft:pottery\nmusic:drum,flute,harp"],
      expected: 6
    },
    { name: "empty", args: [""], expected: 0 },
    {
      name: "missing category",
      args: ["food:taco\ncraft:pottery"],
      expected: 0
    },
    {
      name: "two rosters",
      args: [
        "food:taco\ncraft:art\nmusic:drum\n\nfood:burrito\ncraft:art\nmusic:guitar,bass"
      ],
      expected: 7
    }
  ],
  hiddenTests: [
    {
      name: "extra category counted",
      args: ["food:taco\ncraft:art\nmusic:drum\nextra:foo,bar"],
      expected: 5
    },
    {
      name: "single item categories",
      args: ["food:taco\ncraft:art\nmusic:drum"],
      expected: 3
    },
    {
      name: "blank trailing block",
      args: ["food:taco\ncraft:art\nmusic:drum\n\n\n"],
      expected: 3
    },
    {
      name: "duplicate within roster category",
      args: ["food:taco,taco\ncraft:art\nmusic:drum"],
      expected: 4
    }
  ],
  hints: [
    "Track per-roster: a set of categories present AND a running item count.",
    "Check `required.issubset(categories)` before adding the roster's item count to the global total.",
    "Items are comma-separated; `len(items.split(','))` is the per-line item count."
  ],
  solution:
    "Split on blank lines for rosters. Within each, scan lines and split on the first `:`. Add the category to a set and add `len(items.split(','))` to a per-roster counter. After the roster, add the counter to the total only if the required-category set is a subset of the gathered categories.",
  walkthrough:
    "The two pieces of state (category set and item count) are tracked in parallel and only `commit` together when the validity test passes. That structure keeps the logic flat.",
  complexity: { time: "O(total characters)", space: "O(distinct categories per roster)" },
  part2: {
    id: "part-2-largest-category",
    title: "Part 2: Heaviest category",
    prompt:
      "Across only valid rosters (same definition as Part 1), aggregate item counts by category. Return the name of the category with the largest total item count. Break ties alphabetically (the category whose name sorts first wins). Return the empty string `\"\"` if no roster is valid.",
    entrypoint: "heaviest_category",
    starterCode:
      "def heaviest_category(input_text):\n" +
      "    # Among valid rosters, find the category with the largest total item count.\n" +
      "    # Tie-break alphabetically. Return '' if no valid roster.\n" +
      "    pass\n",
    referenceCode:
      "def heaviest_category(input_text):\n" +
      "    required = {\"food\", \"craft\", \"music\"}\n" +
      "    totals = {}\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        roster_categories = set()\n" +
      "        per_category = {}\n" +
      "        for line in block.split(\"\\n\"):\n" +
      "            line = line.strip()\n" +
      "            if \":\" not in line:\n" +
      "                continue\n" +
      "            category, items = line.split(\":\", 1)\n" +
      "            roster_categories.add(category)\n" +
      "            per_category[category] = per_category.get(category, 0) + len(items.split(\",\"))\n" +
      "        if required <= roster_categories:\n" +
      "            for cat, count in per_category.items():\n" +
      "                totals[cat] = totals.get(cat, 0) + count\n" +
      "    if not totals:\n" +
      "        return \"\"\n" +
      "    best = None\n" +
      "    best_score = -1\n" +
      "    for cat in sorted(totals):\n" +
      "        if totals[cat] > best_score:\n" +
      "            best_score = totals[cat]\n" +
      "            best = cat\n" +
      "    return best\n",
    solutionCode:
      "def heaviest_category(input_text):\n" +
      "    needed = {\"food\", \"craft\", \"music\"}\n" +
      "    totals = {}\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        cats = set()\n" +
      "        scratch = {}\n" +
      "        for raw in block.split(\"\\n\"):\n" +
      "            line = raw.strip()\n" +
      "            if \":\" not in line:\n" +
      "                continue\n" +
      "            cat, body = line.split(\":\", 1)\n" +
      "            cats.add(cat)\n" +
      "            scratch[cat] = scratch.get(cat, 0) + len(body.split(\",\"))\n" +
      "        if needed.issubset(cats):\n" +
      "            for k, v in scratch.items():\n" +
      "                totals[k] = totals.get(k, 0) + v\n" +
      "    if not totals:\n" +
      "        return \"\"\n" +
      "    return min(totals, key=lambda k: (-totals[k], k))\n",
    visibleTests: [
      {
        name: "single roster music wins",
        args: ["food:taco\ncraft:art\nmusic:drum,flute,harp"],
        expected: "music"
      },
      { name: "empty", args: [""], expected: "" },
      {
        name: "no valid rosters",
        args: ["food:taco\ncraft:art"],
        expected: ""
      },
      {
        name: "tie broken alphabetically",
        args: ["food:taco,burrito\ncraft:art,pot\nmusic:drum,harp"],
        expected: "craft"
      }
    ],
    hiddenTests: [
      {
        name: "two rosters food dominates",
        args: [
          "food:a,b,c,d\ncraft:e\nmusic:f\n\nfood:g,h\ncraft:i\nmusic:j"
        ],
        expected: "food"
      },
      {
        name: "extra category wins",
        args: ["food:a\ncraft:b\nmusic:c\nextra:d,e,f,g,h"],
        expected: "extra"
      },
      {
        name: "invalid roster ignored",
        args: ["food:x,y,z\ncraft:w\n\nfood:a\ncraft:b\nmusic:c"],
        expected: "craft"
      }
    ],
    hints: [
      "Compute per-roster category totals first, then merge only the rosters that pass the validity gate.",
      "Tie-break with a composite sort key `(-count, name)`.",
      "Return the empty string when the totals dict is empty."
    ],
    solution:
      "Iterate rosters; per roster, build a `{category: count}` scratch dict and a present-categories set. If the roster is valid, merge the scratch dict into a global totals dict. After all rosters, find the key with the largest count, breaking ties alphabetically; return `\"\"` if no roster contributed.",
    walkthrough:
      "Doing per-roster aggregation in a scratch dict and then a conditional merge keeps invalid rosters from polluting the global totals — a clean way to express \"only valid rosters contribute.\"",
    complexity: { time: "O(total characters)", space: "O(distinct categories)" }
  }
});

const y3d5 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d5-stamp-decoder",
  title: "Day 5: Stamp Decoder",
  difficulty: "medium",
  patterns: ["encoding", "decoding"],
  prompt:
    "Each non-empty line is a 6-character stamp code in base-36 (digits `0-9` then letters `a-z`, lowercase only). Decode each code as a base-36 integer. Return the maximum decoded value across all codes.",
  constraints: [
    "Each non-empty line is exactly 6 characters.",
    "Characters are `0-9` or `a-z` (lowercase).",
    "Use base-36 decoding: `0..9` map to 0..9, `a..z` map to 10..35.",
    "Return -1 for input with no non-empty lines.",
    "Blank lines are ignored."
  ],
  examples: [
    { name: "two codes", args: ["aa0000\n0000zz"], expected: 564110745600 }
  ],
  entrypoint: "max_stamp",
  starterCode:
    "def max_stamp(input_text):\n" +
    "    # Decode each 6-char base-36 code; return the max value.\n" +
    "    pass\n",
  referenceCode:
    "def max_stamp(input_text):\n" +
    "    best = -1\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        value = int(line, 36)\n" +
    "        if value > best:\n" +
    "            best = value\n" +
    "    return best\n",
  solutionCode:
    "def max_stamp(input_text):\n" +
    "    best = -1\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line:\n" +
    "            continue\n" +
    "        v = int(line, 36)\n" +
    "        if v > best:\n" +
    "            best = v\n" +
    "    return best\n",
  visibleTests: [
    { name: "single code", args: ["000001"], expected: 1 },
    { name: "letter at end", args: ["00000a"], expected: 10 },
    { name: "all zero", args: ["000000"], expected: 0 },
    { name: "empty", args: [""], expected: -1 }
  ],
  hiddenTests: [
    { name: "two codes pick max", args: ["00000a\n00000b"], expected: 11 },
    { name: "all max", args: ["zzzzzz"], expected: 2176782335 },
    { name: "digits and letters", args: ["1a2b3c\n0z0z0z"], expected: 77370024 },
    { name: "blank lines ignored", args: ["\n00000a\n\n00000b\n"], expected: 11 }
  ],
  hints: [
    "Python's `int(s, base)` handles base-36 natively — no manual decoding needed.",
    "Track a running maximum so you do not allocate an intermediate list.",
    "Use `str.strip` to ignore stray whitespace and skip blank lines."
  ],
  solution:
    "For each non-empty line, decode with `int(line, 36)` and update a running maximum. Initialize the maximum to `-1` to represent \"no codes seen.\"",
  walkthrough:
    "The puzzle reduces to one line of work per code. The interesting decision is whether to hand-roll the base-36 decode (which the spec asks you to understand) or trust the stdlib — both are acceptable; the latter is faster to write correctly.",
  complexity: { time: "O(total characters)", space: "O(1)" },
  part2: {
    id: "part-2-missing-stamp",
    title: "Part 2: Missing stamp",
    prompt:
      "Decode all codes to integers. Among the set of decoded values, find the smallest integer that is missing while both `value - 1` and `value + 1` are present. Return that integer, or `-1` if no such gap exists.",
    entrypoint: "find_missing_stamp",
    starterCode:
      "def find_missing_stamp(input_text):\n" +
      "    # Find the smallest missing value whose neighbours both exist.\n" +
      "    pass\n",
    referenceCode:
      "def find_missing_stamp(input_text):\n" +
      "    values = set()\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line:\n" +
      "            continue\n" +
      "        values.add(int(line, 36))\n" +
      "    if not values:\n" +
      "        return -1\n" +
      "    sorted_values = sorted(values)\n" +
      "    for i in range(len(sorted_values) - 1):\n" +
      "        if sorted_values[i + 1] - sorted_values[i] == 2:\n" +
      "            return sorted_values[i] + 1\n" +
      "    return -1\n",
    solutionCode:
      "def find_missing_stamp(input_text):\n" +
      "    seen = set()\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if line:\n" +
      "            seen.add(int(line, 36))\n" +
      "    if not seen:\n" +
      "        return -1\n" +
      "    arr = sorted(seen)\n" +
      "    for prev, cur in zip(arr, arr[1:]):\n" +
      "        if cur - prev == 2:\n" +
      "            return prev + 1\n" +
      "    return -1\n",
    visibleTests: [
      { name: "missing between 1 and 3", args: ["000001\n000003"], expected: 2 },
      { name: "empty", args: [""], expected: -1 },
      { name: "no gap", args: ["000001\n000002"], expected: -1 },
      {
        name: "wide range with gap",
        args: ["000001\n000002\n000003\n000005"],
        expected: 4
      }
    ],
    hiddenTests: [
      {
        name: "two gaps return first",
        args: ["000001\n000003\n000005"],
        expected: 2
      },
      {
        name: "single value",
        args: ["00000a"],
        expected: -1
      },
      {
        name: "gap larger than two",
        args: ["000001\n000004"],
        expected: -1
      }
    ],
    hints: [
      "Decode into a sorted list and scan consecutive pairs.",
      "A gap of exactly 2 between consecutive sorted values implies one missing integer in between.",
      "Returning the smallest such missing integer requires scanning in ascending order."
    ],
    solution:
      "Decode every code into a set, then sort. Scan consecutive pairs; the first pair whose difference is exactly 2 has a missing midpoint, which is the answer. Otherwise return `-1`.",
    walkthrough:
      "Sorting plus pairwise scanning is the standard technique for \"find the missing value in a near-contiguous set.\" Using a set up-front handles duplicate codes for free.",
    complexity: { time: "O(n log n)", space: "O(n)" }
  }
});

const y3d6 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d6-overlap-windows",
  title: "Day 6: Overlap Windows",
  difficulty: "medium",
  patterns: ["multi-line records", "set operations"],
  prompt:
    "Records are separated by blank lines. Within a record, each non-empty line is a comma-separated list of strings (tag names). For each record, compute the symmetric difference across all its lines — that is, the count of tags that appear in an odd number of lines within the record (each tag within one line counts once, duplicates within a single line are deduplicated). Sum these counts across records.",
  constraints: [
    "Records separated by `\\n\\n`. Lines within a record separated by `\\n`.",
    "Each non-empty line is a comma-separated list of tag strings (no whitespace inside tags).",
    "Within one line, duplicate tags count once.",
    "Across lines, the answer is the count of tags appearing in an odd number of lines.",
    "Return 0 for empty input or records with no non-empty lines."
  ],
  examples: [
    {
      name: "two records",
      args: ["a,b\nb,c\n\nx,y\nx,y\nx"],
      expected: 3
    }
  ],
  entrypoint: "odd_tag_count",
  starterCode:
    "def odd_tag_count(input_text):\n" +
    "    # Sum across records of |tags that appear in an odd number of lines|.\n" +
    "    pass\n",
  referenceCode:
    "def odd_tag_count(input_text):\n" +
    "    total = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        counts = {}\n" +
    "        had_line = False\n" +
    "        for line in block.split(\"\\n\"):\n" +
    "            line = line.strip()\n" +
    "            if not line:\n" +
    "                continue\n" +
    "            had_line = True\n" +
    "            tags = {token for token in line.split(\",\") if token}\n" +
    "            for tag in tags:\n" +
    "                counts[tag] = counts.get(tag, 0) + 1\n" +
    "        if not had_line:\n" +
    "            continue\n" +
    "        total += sum(1 for c in counts.values() if c % 2 == 1)\n" +
    "    return total\n",
  solutionCode:
    "from collections import Counter\n\n" +
    "def odd_tag_count(input_text):\n" +
    "    out = 0\n" +
    "    for block in input_text.split(\"\\n\\n\"):\n" +
    "        counter = Counter()\n" +
    "        seen_any = False\n" +
    "        for raw in block.split(\"\\n\"):\n" +
    "            line = raw.strip()\n" +
    "            if not line:\n" +
    "                continue\n" +
    "            seen_any = True\n" +
    "            counter.update({t for t in line.split(\",\") if t})\n" +
    "        if seen_any:\n" +
    "            out += sum(1 for c in counter.values() if c % 2)\n" +
    "    return out\n",
  visibleTests: [
    { name: "two records", args: ["a,b\nb,c\n\nx,y\nx,y\nx"], expected: 3 },
    { name: "empty", args: [""], expected: 0 },
    { name: "single line", args: ["a,b,c"], expected: 3 },
    { name: "all even", args: ["a\na"], expected: 0 }
  ],
  hiddenTests: [
    { name: "duplicate within line", args: ["a,a,b\nb,c"], expected: 2 },
    { name: "three lines mix", args: ["a,b\nb,c\nc,a"], expected: 0 },
    {
      name: "mixed records",
      args: ["a\na\na\n\nx\ny\nx,y"],
      expected: 1
    },
    { name: "blank trailing block", args: ["a,b\n\n\n"], expected: 2 }
  ],
  hints: [
    "Convert each line to a set first to deduplicate within-line tags.",
    "Count how many lines each tag appears in within the record.",
    "An odd count means the tag is in the symmetric difference; count those."
  ],
  solution:
    "Per record, build a `Counter` keyed by tag; update with each line's deduplicated tag set. The answer for that record is the count of values whose parity is odd. Sum across records.",
  walkthrough:
    "Symmetric difference across multiple sets is exactly \"count appears an odd number of times.\" Building the counter per record makes that one-line check explicit.",
  complexity: { time: "O(total characters)", space: "O(distinct tags per record)" },
  part2: {
    id: "part-2-shared-by-half",
    title: "Part 2: Tags shared by at least half",
    prompt:
      "Same input. Now within each record, count the tags that appear in at least half of the record's non-empty lines (use ceiling: a record with 3 lines requires the tag to appear in at least 2 lines; a record with 4 lines requires at least 2; a record with 5 lines requires at least 3). Sum across records.",
    entrypoint: "majority_tag_count",
    starterCode:
      "def majority_tag_count(input_text):\n" +
      "    # Count tags appearing in at least ceil(L/2) lines, summed across records.\n" +
      "    pass\n",
    referenceCode:
      "def majority_tag_count(input_text):\n" +
      "    total = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        counts = {}\n" +
      "        lines = 0\n" +
      "        for line in block.split(\"\\n\"):\n" +
      "            line = line.strip()\n" +
      "            if not line:\n" +
      "                continue\n" +
      "            lines += 1\n" +
      "            tags = {token for token in line.split(\",\") if token}\n" +
      "            for tag in tags:\n" +
      "                counts[tag] = counts.get(tag, 0) + 1\n" +
      "        if lines == 0:\n" +
      "            continue\n" +
      "        threshold = (lines + 1) // 2\n" +
      "        total += sum(1 for c in counts.values() if c >= threshold)\n" +
      "    return total\n",
    solutionCode:
      "from collections import Counter\n\n" +
      "def majority_tag_count(input_text):\n" +
      "    out = 0\n" +
      "    for block in input_text.split(\"\\n\\n\"):\n" +
      "        counter = Counter()\n" +
      "        rows = 0\n" +
      "        for raw in block.split(\"\\n\"):\n" +
      "            line = raw.strip()\n" +
      "            if not line:\n" +
      "                continue\n" +
      "            rows += 1\n" +
      "            counter.update({t for t in line.split(\",\") if t})\n" +
      "        if rows == 0:\n" +
      "            continue\n" +
      "        threshold = (rows + 1) // 2\n" +
      "        out += sum(1 for c in counter.values() if c >= threshold)\n" +
      "    return out\n",
    visibleTests: [
      { name: "two records", args: ["a,b\nb,c\n\nx,y\nx,y\nx"], expected: 5 },
      { name: "empty", args: [""], expected: 0 },
      { name: "single line", args: ["a,b,c"], expected: 3 },
      { name: "three lines majority is two", args: ["a\nb\na,b"], expected: 2 }
    ],
    hiddenTests: [
      { name: "four lines threshold two", args: ["a\na\nb\nc"], expected: 1 },
      { name: "five lines threshold three", args: ["a\na\na\nb\nc"], expected: 1 },
      { name: "no majority", args: ["a\nb\nc\nd"], expected: 0 },
      { name: "blank trailing block", args: ["a\na\nb\n\n\n"], expected: 1 }
    ],
    hints: [
      "Threshold is `ceil(lines / 2)` which equals `(lines + 1) // 2`.",
      "Same per-record counter as Part 1; only the predicate changes.",
      "Skip records with zero non-empty lines so threshold math doesn't divide by zero."
    ],
    solution:
      "Count line appearances per tag exactly as in Part 1. After the record, compute `threshold = (lines + 1) // 2` and count tags whose appearance count is at least the threshold.",
    walkthrough:
      "Substituting one predicate for another is a clean Part 2 move. The ceiling formula `(n + 1) // 2` is the standard integer-arithmetic ceiling-of-half — worth knowing because it sidesteps floats.",
    complexity: { time: "O(total characters)", space: "O(distinct tags per record)" }
  }
});

const y3d7 = aocProblem({
  setId: Y3_SET_ID,
  id: "aoc-y3-d7-task-dependencies",
  title: "Day 7: Task Dependencies",
  difficulty: "medium",
  patterns: ["graph", "topological sort", "DAG depth"],
  prompt:
    "Each non-empty line has the shape `TASK before A, B, C.` meaning that completing `TASK` is a prerequisite for tasks `A`, `B`, and `C`. The body can also be exactly the literal `nothing` (e.g., `TASK before nothing.`), meaning `TASK` has no downstream tasks. All identifiers are single lowercase words. Return the depth of the longest dependency chain in the input: a single task with no children has depth 1; a parent of one leaf has depth 2; and so on. Return 0 for empty input.",
  constraints: [
    "Identifiers are single lowercase words (no spaces).",
    "Each rule ends with a period.",
    "Empty form is exactly `TASK before nothing.`.",
    "Body items are comma-space separated: `A, B, C`.",
    "Assume the dependency graph is a DAG (no cycles)."
  ],
  examples: [
    {
      name: "chain of three",
      args: [
        "a before b.\nb before c.\nc before nothing."
      ],
      expected: 3
    }
  ],
  entrypoint: "longest_chain",
  starterCode:
    "def longest_chain(input_text):\n" +
    "    # Return the depth of the longest path in the dependency DAG (in node count).\n" +
    "    pass\n",
  referenceCode:
    "def longest_chain(input_text):\n" +
    "    children = {}\n" +
    "    all_nodes = set()\n" +
    "    for line in input_text.split(\"\\n\"):\n" +
    "        line = line.strip()\n" +
    "        if not line.endswith(\".\"):\n" +
    "            continue\n" +
    "        body = line[:-1]\n" +
    "        if \" before \" not in body:\n" +
    "            continue\n" +
    "        head, tail = body.split(\" before \", 1)\n" +
    "        head = head.strip()\n" +
    "        all_nodes.add(head)\n" +
    "        if tail.strip() == \"nothing\":\n" +
    "            children.setdefault(head, [])\n" +
    "            continue\n" +
    "        kids = [token.strip() for token in tail.split(\",\") if token.strip()]\n" +
    "        children.setdefault(head, []).extend(kids)\n" +
    "        for kid in kids:\n" +
    "            all_nodes.add(kid)\n" +
    "            children.setdefault(kid, [])\n" +
    "    if not all_nodes:\n" +
    "        return 0\n" +
    "    memo = {}\n" +
    "    def depth(node):\n" +
    "        if node in memo:\n" +
    "            return memo[node]\n" +
    "        kids = children.get(node, [])\n" +
    "        if not kids:\n" +
    "            memo[node] = 1\n" +
    "            return 1\n" +
    "        best = 0\n" +
    "        for kid in kids:\n" +
    "            d = depth(kid)\n" +
    "            if d > best:\n" +
    "                best = d\n" +
    "        memo[node] = 1 + best\n" +
    "        return memo[node]\n" +
    "    return max(depth(node) for node in all_nodes)\n",
  solutionCode:
    "from functools import lru_cache\n\n" +
    "def longest_chain(input_text):\n" +
    "    children = {}\n" +
    "    nodes = set()\n" +
    "    for raw in input_text.split(\"\\n\"):\n" +
    "        line = raw.strip()\n" +
    "        if not line.endswith(\".\") or \" before \" not in line:\n" +
    "            continue\n" +
    "        head, tail = line[:-1].split(\" before \", 1)\n" +
    "        head = head.strip()\n" +
    "        nodes.add(head)\n" +
    "        if tail.strip() == \"nothing\":\n" +
    "            children.setdefault(head, [])\n" +
    "            continue\n" +
    "        kids = [t.strip() for t in tail.split(\",\") if t.strip()]\n" +
    "        children[head] = children.get(head, []) + kids\n" +
    "        nodes.update(kids)\n" +
    "    if not nodes:\n" +
    "        return 0\n" +
    "\n" +
    "    @lru_cache(maxsize=None)\n" +
    "    def depth(node):\n" +
    "        kids = children.get(node, [])\n" +
    "        return 1 + max((depth(k) for k in kids), default=0)\n" +
    "\n" +
    "    return max(depth(n) for n in nodes)\n",
  visibleTests: [
    {
      name: "chain of three",
      args: ["a before b.\nb before c.\nc before nothing."],
      expected: 3
    },
    { name: "empty", args: [""], expected: 0 },
    {
      name: "single leaf",
      args: ["only before nothing."],
      expected: 1
    },
    {
      name: "branching",
      args: ["root before a, b.\na before nothing.\nb before nothing."],
      expected: 2
    }
  ],
  hiddenTests: [
    {
      name: "two roots one chain wins",
      args: [
        "a before nothing.\nb before c.\nc before d.\nd before nothing."
      ],
      expected: 3
    },
    {
      name: "diamond",
      args: [
        "top before left, right.\nleft before bottom.\nright before bottom.\nbottom before nothing."
      ],
      expected: 3
    },
    {
      name: "long chain",
      args: [
        "a before b.\nb before c.\nc before d.\nd before e.\ne before nothing."
      ],
      expected: 5
    }
  ],
  hints: [
    "Build the `parent -> children` map; nodes with no rule line are implicit leaves.",
    "Memoize `depth(node) = 1 + max(depth(child) for child in children)` with leaf depth 1.",
    "Take the maximum depth across all nodes — the longest chain may not start at any specific root."
  ],
  solution:
    "Parse each rule. Build a `node -> list of children` dict and a set of all nodes seen (heads and listed children alike). For every node, compute `depth(node) = 1 + max(depth(child))` with the leaf base case of 1. Memoize. Return the maximum `depth` over all nodes.",
  walkthrough:
    "The DAG longest-path problem reduces to a recursion with memoization. Considering all nodes as potential starts (not just roots) handles inputs where some nodes appear only as children of multiple rules.",
  complexity: { time: "O(nodes + edges)", space: "O(nodes)" },
  part2: {
    id: "part-2-task-ordering",
    title: "Part 2: Earliest-time scheduling",
    prompt:
      "Same input. Each task takes `1` time unit. Tasks with no prerequisites can start at time 0. Each task's start time equals 1 plus the maximum start time of its prerequisites (it must wait for all prerequisites to finish). Return the total finish time of the schedule: the maximum `start_time + 1` across all tasks. Equivalent to the depth result of Part 1, but computed from the inverted graph — tasks that have no parents start at 0.",
    entrypoint: "schedule_finish",
    starterCode:
      "def schedule_finish(input_text):\n" +
      "    # Compute finish time of an ALAP-style schedule on the dependency DAG.\n" +
      "    pass\n",
    referenceCode:
      "def schedule_finish(input_text):\n" +
      "    children = {}\n" +
      "    nodes = set()\n" +
      "    for line in input_text.split(\"\\n\"):\n" +
      "        line = line.strip()\n" +
      "        if not line.endswith(\".\") or \" before \" not in line:\n" +
      "            continue\n" +
      "        head, tail = line[:-1].split(\" before \", 1)\n" +
      "        head = head.strip()\n" +
      "        nodes.add(head)\n" +
      "        if tail.strip() == \"nothing\":\n" +
      "            children.setdefault(head, [])\n" +
      "            continue\n" +
      "        kids = [token.strip() for token in tail.split(\",\") if token.strip()]\n" +
      "        children.setdefault(head, []).extend(kids)\n" +
      "        for kid in kids:\n" +
      "            nodes.add(kid)\n" +
      "            children.setdefault(kid, [])\n" +
      "    if not nodes:\n" +
      "        return 0\n" +
      "    parents = {node: set() for node in nodes}\n" +
      "    for parent, kids in children.items():\n" +
      "        for kid in kids:\n" +
      "            parents[kid].add(parent)\n" +
      "    start = {}\n" +
      "    def resolve(node):\n" +
      "        if node in start:\n" +
      "            return start[node]\n" +
      "        if not parents[node]:\n" +
      "            start[node] = 0\n" +
      "            return 0\n" +
      "        best = max(resolve(parent) for parent in parents[node])\n" +
      "        start[node] = best + 1\n" +
      "        return start[node]\n" +
      "    return max(resolve(node) for node in nodes) + 1\n",
    solutionCode:
      "from functools import lru_cache\n\n" +
      "def schedule_finish(input_text):\n" +
      "    children = {}\n" +
      "    nodes = set()\n" +
      "    for raw in input_text.split(\"\\n\"):\n" +
      "        line = raw.strip()\n" +
      "        if not line.endswith(\".\") or \" before \" not in line:\n" +
      "            continue\n" +
      "        head, tail = line[:-1].split(\" before \", 1)\n" +
      "        head = head.strip()\n" +
      "        nodes.add(head)\n" +
      "        if tail.strip() == \"nothing\":\n" +
      "            children.setdefault(head, [])\n" +
      "            continue\n" +
      "        kids = [t.strip() for t in tail.split(\",\") if t.strip()]\n" +
      "        children[head] = children.get(head, []) + kids\n" +
      "        nodes.update(kids)\n" +
      "    if not nodes:\n" +
      "        return 0\n" +
      "    parents = {n: [] for n in nodes}\n" +
      "    for p, ks in children.items():\n" +
      "        for k in ks:\n" +
      "            parents[k].append(p)\n" +
      "\n" +
      "    @lru_cache(maxsize=None)\n" +
      "    def start(node):\n" +
      "        ps = parents.get(node, [])\n" +
      "        if not ps:\n" +
      "            return 0\n" +
      "        return 1 + max(start(p) for p in ps)\n" +
      "\n" +
      "    return max(start(n) for n in nodes) + 1\n",
    visibleTests: [
      {
        name: "chain of three",
        args: ["a before b.\nb before c.\nc before nothing."],
        expected: 3
      },
      { name: "empty", args: [""], expected: 0 },
      { name: "single task", args: ["only before nothing."], expected: 1 },
      {
        name: "branching",
        args: ["root before a, b.\na before nothing.\nb before nothing."],
        expected: 2
      }
    ],
    hiddenTests: [
      {
        name: "diamond bottom waits for both",
        args: [
          "top before left, right.\nleft before bottom.\nright before bottom.\nbottom before nothing."
        ],
        expected: 3
      },
      {
        name: "parallel two roots",
        args: [
          "a before nothing.\nb before c.\nc before d.\nd before nothing."
        ],
        expected: 3
      },
      {
        name: "long chain",
        args: [
          "a before b.\nb before c.\nc before d.\nd before e.\ne before nothing."
        ],
        expected: 5
      }
    ],
    hints: [
      "Invert the children map into a parents map.",
      "A node's start time is `1 + max(parent_start_times)`, or 0 if it has no parents.",
      "Finish time of the schedule is the max start time plus 1 (each task takes one unit)."
    ],
    solution:
      "Build the parent map by inverting the rules. Memoize `start(node)`: 0 if no parents, otherwise `1 + max(start(parent))`. Return `max(start(node)) + 1` across all nodes.",
    walkthrough:
      "Earliest-start scheduling on a DAG is the dual of longest-path. The recursion mirrors Part 1's `depth` recurrence but operates on parents instead of children, and the offset (`+1` for finish) is the per-task duration.",
    complexity: { time: "O(nodes + edges)", space: "O(nodes)" }
  }
});

const yearThree: ProblemSet = {
  id: Y3_SET_ID,
  title: "Year Three: Festival Logistics",
  summary: "Seven AoC-shaped exercises ramping from sliding windows to schedule planning on a DAG.",
  intro:
    "Same input/output contract as Years One and Two: one string in, one answer out, Part 2 extends the model. Year Three's puzzles emphasize aggregation, format-strict parsing, and DAG reasoning so muscle memory from Years One and Two does not carry you.",
  problems: [y3d1, y3d2, y3d3, y3d4, y3d5, y3d6, y3d7]
};

const yearOne: ProblemSet = {
  id: Y1_SET_ID,
  title: "Year One: Field Survey",
  summary: "Seven AoC-shaped exercises ramping from a one-pass warmup to a recursive contains-graph.",
  intro:
    "Each day takes one multi-line string, parses it into a small model, and answers a question. Part 2 always reuses Part 1's parse and extends the model — the same rhythm a generalist coding interview uses when the interviewer says \"now also handle X.\"",
  problems: [y1d1, y1d2, y1d3, y1d4, y1d5, y1d6, y1d7]
};

export const aocSets: ProblemSet[] = [yearOne, yearTwo, yearThree];

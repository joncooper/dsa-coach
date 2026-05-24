import type { FunctionSignature } from "../../src/core/types.js";

type LanguageId = "python" | "typescript" | "go" | "scala";

interface LanguageFiles {
  entrypoint: string;
  extension: string;
  starter: string;
  reference: string;
}

interface CuratedProblem {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
}

export const hashingCurated: Record<string, CuratedProblem> = {
  "pairable-remainders": {
    signature: {
      name: "pairableRemainders",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "k", type: { type: "number" } }
      ],
      output: { type: "boolean" }
    },
    languages: {
      python: py("pairable_remainders", "nums: list[int], k: int", "bool", [
        "if len(nums) % 2 == 1:",
        "    return False",
        "counts = {}",
        "for num in nums:",
        "    remainder = num % k",
        "    counts[remainder] = counts.get(remainder, 0) + 1",
        "for remainder, count in counts.items():",
        "    complement = (-remainder) % k",
        "    if remainder == complement:",
        "        if count % 2 != 0:",
        "            return False",
        "    elif count != counts.get(complement, 0):",
        "        return False",
        "return True"
      ]),
      typescript: ts("pairableRemainders", "nums: number[], k: number", "boolean", [
        "if (nums.length % 2 === 1) return false;",
        "const counts = new Map<number, number>();",
        "for (const num of nums) {",
        "  const remainder = ((num % k) + k) % k;",
        "  counts.set(remainder, (counts.get(remainder) ?? 0) + 1);",
        "}",
        "for (const [remainder, count] of counts) {",
        "  const complement = (k - remainder) % k;",
        "  if (remainder === complement) {",
        "    if (count % 2 !== 0) return false;",
        "  } else if (count !== (counts.get(complement) ?? 0)) {",
        "    return false;",
        "  }",
        "}",
        "return true;"
      ]),
      go: go("PairableRemainders", "nums []int, k int", "bool", [
        "if len(nums)%2 == 1 {",
        "\treturn false",
        "}",
        "counts := map[int]int{}",
        "for _, num := range nums {",
        "\tremainder := ((num % k) + k) % k",
        "\tcounts[remainder]++",
        "}",
        "for remainder, count := range counts {",
        "\tcomplement := (k - remainder) % k",
        "\tif remainder == complement {",
        "\t\tif count%2 != 0 {",
        "\t\t\treturn false",
        "\t\t}",
        "\t} else if count != counts[complement] {",
        "\t\treturn false",
        "\t}",
        "}",
        "return true"
      ]),
      scala: scala("pairableRemainders", "nums: Seq[Int], k: Int", "Boolean", [
        "if (nums.length % 2 == 1) return false",
        "val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)",
        "for (num <- nums) {",
        "  val remainder = ((num % k) + k) % k",
        "  counts(remainder) = counts(remainder) + 1",
        "}",
        "for ((remainder, count) <- counts) {",
        "  val complement = (k - remainder) % k",
        "  if (remainder == complement) {",
        "    if (count % 2 != 0) return false",
        "  } else if (count != counts(complement)) return false",
        "}",
        "true"
      ])
    }
  },
  "first-unique-token": {
    signature: {
      name: "firstUniqueToken",
      inputs: [{ name: "tokens", type: arrayOfStrings() }],
      output: { type: "string" }
    },
    languages: {
      python: py("first_unique_token", "tokens: list[str]", "str", [
        "counts = {}",
        "for token in tokens:",
        "    counts[token] = counts.get(token, 0) + 1",
        "for token in tokens:",
        "    if counts[token] == 1:",
        "        return token",
        "return \"\""
      ]),
      typescript: ts("firstUniqueToken", "tokens: string[]", "string", [
        "const counts = new Map<string, number>();",
        "for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);",
        "for (const token of tokens) {",
        "  if (counts.get(token) === 1) return token;",
        "}",
        "return \"\";"
      ]),
      go: go("FirstUniqueToken", "tokens []string", "string", [
        "counts := map[string]int{}",
        "for _, token := range tokens {",
        "\tcounts[token]++",
        "}",
        "for _, token := range tokens {",
        "\tif counts[token] == 1 {",
        "\t\treturn token",
        "\t}",
        "}",
        "return \"\""
      ]),
      scala: scala("firstUniqueToken", "tokens: Seq[String]", "String", [
        "val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)",
        "for (token <- tokens) counts(token) = counts(token) + 1",
        "tokens.find(token => counts(token) == 1).getOrElse(\"\")"
      ])
    }
  },
  "anagram-bucket-sizes": {
    signature: {
      name: "anagramBucketSizes",
      inputs: [{ name: "words", type: arrayOfStrings() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("anagram_bucket_sizes", "words: list[str]", "list[int]", [
        "buckets = {}",
        "for word in words:",
        "    key = \"\".join(sorted(word))",
        "    buckets[key] = buckets.get(key, 0) + 1",
        "return sorted(buckets.values())"
      ]),
      typescript: ts("anagramBucketSizes", "words: string[]", "number[]", [
        "const buckets = new Map<string, number>();",
        "for (const word of words) {",
        "  const key = [...word].sort().join(\"\");",
        "  buckets.set(key, (buckets.get(key) ?? 0) + 1);",
        "}",
        "return [...buckets.values()].sort((left, right) => left - right);"
      ]),
      go: goWithImport("AnagramBucketSizes", "words []string", "[]int", ["\"sort\"", "\"strings\""], [
        "buckets := map[string]int{}",
        "for _, word := range words {",
        "\tletters := strings.Split(word, \"\")",
        "\tsort.Strings(letters)",
        "\tkey := strings.Join(letters, \"\")",
        "\tbuckets[key]++",
        "}",
        "sizes := []int{}",
        "for _, size := range buckets {",
        "\tsizes = append(sizes, size)",
        "}",
        "sort.Ints(sizes)",
        "return sizes"
      ]),
      scala: scala("anagramBucketSizes", "words: Seq[String]", "Seq[Int]", [
        "val buckets = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)",
        "for (word <- words) {",
        "  val key = word.sorted",
        "  buckets(key) = buckets(key) + 1",
        "}",
        "buckets.values.toSeq.sorted"
      ])
    }
  },
  "longest-distinct-span": {
    signature: {
      name: "longestDistinctSpan",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "number" }
    },
    languages: {
      python: py("longest_distinct_span", "text: str", "int", [
        "last_seen = {}",
        "left = 0",
        "best = 0",
        "for right, char in enumerate(text):",
        "    if char in last_seen and last_seen[char] >= left:",
        "        left = last_seen[char] + 1",
        "    last_seen[char] = right",
        "    best = max(best, right - left + 1)",
        "return best"
      ]),
      typescript: ts("longestDistinctSpan", "text: string", "number", [
        "const lastSeen = new Map<string, number>();",
        "let left = 0;",
        "let best = 0;",
        "for (let right = 0; right < text.length; right += 1) {",
        "  const char = text[right];",
        "  const previous = lastSeen.get(char);",
        "  if (previous !== undefined && previous >= left) left = previous + 1;",
        "  lastSeen.set(char, right);",
        "  best = Math.max(best, right - left + 1);",
        "}",
        "return best;"
      ]),
      go: go("LongestDistinctSpan", "text string", "int", [
        "lastSeen := map[rune]int{}",
        "chars := []rune(text)",
        "left := 0",
        "best := 0",
        "for right, char := range chars {",
        "\tif previous, ok := lastSeen[char]; ok && previous >= left {",
        "\t\tleft = previous + 1",
        "\t}",
        "\tlastSeen[char] = right",
        "\tlength := right - left + 1",
        "\tif length > best {",
        "\t\tbest = length",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("longestDistinctSpan", "text: String", "Int", [
        "val lastSeen = scala.collection.mutable.Map.empty[Char, Int]",
        "var left = 0",
        "var best = 0",
        "for (right <- text.indices) {",
        "  val char = text.charAt(right)",
        "  lastSeen.get(char).foreach { previous =>",
        "    if (previous >= left) left = previous + 1",
        "  }",
        "  lastSeen(char) = right",
        "  best = math.max(best, right - left + 1)",
        "}",
        "best"
      ])
    }
  },
  "count-target-sum-subarrays": {
    signature: {
      name: "countTargetSumSubarrays",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "target", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("count_target_sum_subarrays", "nums: list[int], target: int", "int", [
        "counts = {0: 1}",
        "prefix = 0",
        "total = 0",
        "for num in nums:",
        "    prefix += num",
        "    total += counts.get(prefix - target, 0)",
        "    counts[prefix] = counts.get(prefix, 0) + 1",
        "return total"
      ]),
      typescript: ts("countTargetSumSubarrays", "nums: number[], target: number", "number", [
        "const counts = new Map<number, number>([[0, 1]]);",
        "let prefix = 0;",
        "let total = 0;",
        "for (const num of nums) {",
        "  prefix += num;",
        "  total += counts.get(prefix - target) ?? 0;",
        "  counts.set(prefix, (counts.get(prefix) ?? 0) + 1);",
        "}",
        "return total;"
      ]),
      go: go("CountTargetSumSubarrays", "nums []int, target int", "int", [
        "counts := map[int]int{0: 1}",
        "prefix := 0",
        "total := 0",
        "for _, num := range nums {",
        "\tprefix += num",
        "\ttotal += counts[prefix-target]",
        "\tcounts[prefix]++",
        "}",
        "return total"
      ]),
      scala: scala("countTargetSumSubarrays", "nums: Seq[Int], target: Int", "Int", [
        "val counts = scala.collection.mutable.Map(0 -> 1).withDefaultValue(0)",
        "var prefix = 0",
        "var total = 0",
        "for (num <- nums) {",
        "  prefix += num",
        "  total += counts(prefix - target)",
        "  counts(prefix) = counts(prefix) + 1",
        "}",
        "total"
      ])
    }
  },
  "common-customers": {
    signature: {
      name: "commonCustomers",
      inputs: [
        { name: "morning", type: arrayOfNumbers() },
        { name: "evening", type: arrayOfNumbers() }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("common_customers", "morning: list[int], evening: list[int]", "int", [
        "return len(set(morning) & set(evening))"
      ]),
      typescript: ts("commonCustomers", "morning: number[], evening: number[]", "number", [
        "const seen = new Set(morning);",
        "let count = 0;",
        "for (const customer of new Set(evening)) {",
        "  if (seen.has(customer)) count += 1;",
        "}",
        "return count;"
      ]),
      go: go("CommonCustomers", "morning []int, evening []int", "int", [
        "seen := map[int]bool{}",
        "for _, customer := range morning {",
        "\tseen[customer] = true",
        "}",
        "common := map[int]bool{}",
        "for _, customer := range evening {",
        "\tif seen[customer] {",
        "\t\tcommon[customer] = true",
        "\t}",
        "}",
        "return len(common)"
      ]),
      scala: scala("commonCustomers", "morning: Seq[Int], evening: Seq[Int]", "Int", [
        "morning.toSet.intersect(evening.toSet).size"
      ])
    }
  },
  "hashing-bonus-01": {
    signature: {
      name: "containsDuplicateWithinK",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "k", type: { type: "number" } }
      ],
      output: { type: "boolean" }
    },
    languages: {
      python: py("contains_duplicate_within_k", "nums: list[int], k: int", "bool", [
        "last_seen = {}",
        "for index, num in enumerate(nums):",
        "    if num in last_seen and index - last_seen[num] <= k:",
        "        return True",
        "    last_seen[num] = index",
        "return False"
      ]),
      typescript: ts("containsDuplicateWithinK", "nums: number[], k: number", "boolean", [
        "const lastSeen = new Map<number, number>();",
        "for (let index = 0; index < nums.length; index += 1) {",
        "  const previous = lastSeen.get(nums[index]);",
        "  if (previous !== undefined && index - previous <= k) return true;",
        "  lastSeen.set(nums[index], index);",
        "}",
        "return false;"
      ]),
      go: go("ContainsDuplicateWithinK", "nums []int, k int", "bool", [
        "lastSeen := map[int]int{}",
        "for index, num := range nums {",
        "\tif previous, ok := lastSeen[num]; ok && index-previous <= k {",
        "\t\treturn true",
        "\t}",
        "\tlastSeen[num] = index",
        "}",
        "return false"
      ]),
      scala: scala("containsDuplicateWithinK", "nums: Seq[Int], k: Int", "Boolean", [
        "val lastSeen = scala.collection.mutable.Map.empty[Int, Int]",
        "for ((num, index) <- nums.zipWithIndex) {",
        "  lastSeen.get(num).foreach { previous =>",
        "    if (index - previous <= k) return true",
        "  }",
        "  lastSeen(num) = index",
        "}",
        "false"
      ])
    }
  },
  "hashing-bonus-02": {
    signature: {
      name: "mostFrequentValue",
      inputs: [{ name: "values", type: arrayOfNumbers() }],
      output: { type: "number", nullable: true }
    },
    languages: {
      python: py("most_frequent_value", "values: list[int]", "int | None", [
        "if not values:",
        "    return None",
        "counts = {}",
        "for value in values:",
        "    counts[value] = counts.get(value, 0) + 1",
        "best = values[0]",
        "for value in values:",
        "    if counts[value] > counts[best]:",
        "        best = value",
        "return best"
      ]),
      typescript: ts("mostFrequentValue", "values: number[]", "number | null", [
        "if (values.length === 0) return null;",
        "const counts = new Map<number, number>();",
        "for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);",
        "let best = values[0];",
        "for (const value of values) {",
        "  if ((counts.get(value) ?? 0) > (counts.get(best) ?? 0)) best = value;",
        "}",
        "return best;"
      ]),
      go: go("MostFrequentValue", "values []int", "*int", [
        "if len(values) == 0 {",
        "\treturn nil",
        "}",
        "counts := map[int]int{}",
        "for _, value := range values {",
        "\tcounts[value]++",
        "}",
        "best := values[0]",
        "for _, value := range values {",
        "\tif counts[value] > counts[best] {",
        "\t\tbest = value",
        "\t}",
        "}",
        "return &best"
      ]),
      scala: scala("mostFrequentValue", "values: Seq[Int]", "Option[Int]", [
        "if (values.isEmpty) return None",
        "val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)",
        "for (value <- values) counts(value) = counts(value) + 1",
        "var best = values.head",
        "for (value <- values) {",
        "  if (counts(value) > counts(best)) best = value",
        "}",
        "Some(best)"
      ])
    }
  },
  "hashing-bonus-03": simpleArrayNumber("missingNumber", "nums", [
    "const seen = new Set(nums);",
    "for (let candidate = 0; candidate <= nums.length; candidate += 1) {",
    "  if (!seen.has(candidate)) return candidate;",
    "}",
    "return nums.length;"
  ], [
    "seen = set(nums)",
    "for candidate in range(len(nums) + 1):",
    "    if candidate not in seen:",
    "        return candidate",
    "return len(nums)"
  ], [
    "seen := map[int]bool{}",
    "for _, num := range nums {",
    "\tseen[num] = true",
    "}",
    "for candidate := 0; candidate <= len(nums); candidate++ {",
    "\tif !seen[candidate] {",
    "\t\treturn candidate",
    "\t}",
    "}",
    "return len(nums)"
  ], [
    "val seen = nums.toSet",
    "for (candidate <- 0 to nums.length) {",
    "  if (!seen.contains(candidate)) return candidate",
    "}",
    "nums.length"
  ], "MissingNumber"),
  "hashing-bonus-04": {
    signature: {
      name: "twoSumExists",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "target", type: { type: "number" } }
      ],
      output: { type: "boolean" }
    },
    languages: {
      python: py("two_sum_exists", "nums: list[int], target: int", "bool", [
        "seen = set()",
        "for num in nums:",
        "    if target - num in seen:",
        "        return True",
        "    seen.add(num)",
        "return False"
      ]),
      typescript: ts("twoSumExists", "nums: number[], target: number", "boolean", [
        "const seen = new Set<number>();",
        "for (const num of nums) {",
        "  if (seen.has(target - num)) return true;",
        "  seen.add(num);",
        "}",
        "return false;"
      ]),
      go: go("TwoSumExists", "nums []int, target int", "bool", [
        "seen := map[int]bool{}",
        "for _, num := range nums {",
        "\tif seen[target-num] {",
        "\t\treturn true",
        "\t}",
        "\tseen[num] = true",
        "}",
        "return false"
      ]),
      scala: scala("twoSumExists", "nums: Seq[Int], target: Int", "Boolean", [
        "val seen = scala.collection.mutable.Set.empty[Int]",
        "for (num <- nums) {",
        "  if (seen.contains(target - num)) return true",
        "  seen.add(num)",
        "}",
        "false"
      ])
    }
  },
  "hashing-bonus-05": {
    signature: {
      name: "firstRepeatedValue",
      inputs: [{ name: "values", type: arrayOfNumbers() }],
      output: { type: "number", nullable: true }
    },
    languages: {
      python: py("first_repeated_value", "values: list[int]", "int | None", [
        "seen = set()",
        "for value in values:",
        "    if value in seen:",
        "        return value",
        "    seen.add(value)",
        "return None"
      ]),
      typescript: ts("firstRepeatedValue", "values: number[]", "number | null", [
        "const seen = new Set<number>();",
        "for (const value of values) {",
        "  if (seen.has(value)) return value;",
        "  seen.add(value);",
        "}",
        "return null;"
      ]),
      go: go("FirstRepeatedValue", "values []int", "*int", [
        "seen := map[int]bool{}",
        "for _, value := range values {",
        "\tif seen[value] {",
        "\t\treturn &value",
        "\t}",
        "\tseen[value] = true",
        "}",
        "return nil"
      ]),
      scala: scala("firstRepeatedValue", "values: Seq[Int]", "Option[Int]", [
        "val seen = scala.collection.mutable.Set.empty[Int]",
        "values.find { value =>",
        "  val repeated = seen.contains(value)",
        "  seen.add(value)",
        "  repeated",
        "}"
      ])
    }
  },
  "hashing-bonus-06": {
    signature: {
      name: "symmetricDifferenceSize",
      inputs: [
        { name: "a", type: arrayOfNumbers() },
        { name: "b", type: arrayOfNumbers() }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("symmetric_difference_size", "a: list[int], b: list[int]", "int", [
        "left = set(a)",
        "right = set(b)",
        "return len((left - right) | (right - left))"
      ]),
      typescript: ts("symmetricDifferenceSize", "a: number[], b: number[]", "number", [
        "const left = new Set(a);",
        "const right = new Set(b);",
        "let total = 0;",
        "for (const value of left) if (!right.has(value)) total += 1;",
        "for (const value of right) if (!left.has(value)) total += 1;",
        "return total;"
      ]),
      go: go("SymmetricDifferenceSize", "a []int, b []int", "int", [
        "left := map[int]bool{}",
        "right := map[int]bool{}",
        "for _, value := range a {",
        "\tleft[value] = true",
        "}",
        "for _, value := range b {",
        "\tright[value] = true",
        "}",
        "total := 0",
        "for value := range left {",
        "\tif !right[value] {",
        "\t\ttotal++",
        "\t}",
        "}",
        "for value := range right {",
        "\tif !left[value] {",
        "\t\ttotal++",
        "\t}",
        "}",
        "return total"
      ]),
      scala: scala("symmetricDifferenceSize", "a: Seq[Int], b: Seq[Int]", "Int", [
        "val left = a.toSet",
        "val right = b.toSet",
        "((left -- right) ++ (right -- left)).size"
      ])
    }
  },
  "hashing-bonus-07": {
    signature: {
      name: "charFrequencyTable",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "object" }
    },
    languages: {
      python: py("char_frequency_table", "text: str", "dict[str, int]", [
        "counts = {}",
        "for char in text:",
        "    counts[char] = counts.get(char, 0) + 1",
        "return counts"
      ]),
      typescript: ts("charFrequencyTable", "text: string", "Record<string, number>", [
        "const counts: Record<string, number> = {};",
        "for (const char of text) counts[char] = (counts[char] ?? 0) + 1;",
        "return counts;"
      ]),
      go: go("CharFrequencyTable", "text string", "map[string]int", [
        "counts := map[string]int{}",
        "for _, char := range text {",
        "\tcounts[string(char)]++",
        "}",
        "return counts"
      ]),
      scala: scala("charFrequencyTable", "text: String", "Map[String, Int]", [
        "val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)",
        "for (char <- text) {",
        "  val key = char.toString",
        "  counts(key) = counts(key) + 1",
        "}",
        "counts.toMap"
      ])
    }
  },
  "hashing-bonus-08": {
    signature: {
      name: "groupByFirstLetter",
      inputs: [{ name: "words", type: arrayOfStrings() }],
      output: { type: "object" }
    },
    languages: {
      python: py("group_by_first_letter", "words: list[str]", "dict[str, list[str]]", [
        "groups = {}",
        "for word in words:",
        "    if not word:",
        "        continue",
        "    groups.setdefault(word[0], []).append(word)",
        "return {key: groups[key] for key in sorted(groups)}"
      ]),
      typescript: ts("groupByFirstLetter", "words: string[]", "Record<string, string[]>", [
        "const groups = new Map<string, string[]>();",
        "for (const word of words) {",
        "  if (word.length === 0) continue;",
        "  const key = word[0];",
        "  if (!groups.has(key)) groups.set(key, []);",
        "  groups.get(key)!.push(word);",
        "}",
        "return Object.fromEntries([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)));"
      ]),
      go: goWithImport("GroupByFirstLetter", "words []string", "map[string][]string", ["\"sort\""], [
        "groups := map[string][]string{}",
        "for _, word := range words {",
        "\tif len(word) == 0 {",
        "\t\tcontinue",
        "\t}",
        "\tkey := string([]rune(word)[0])",
        "\tgroups[key] = append(groups[key], word)",
        "}",
        "keys := []string{}",
        "for key := range groups {",
        "\tkeys = append(keys, key)",
        "}",
        "sort.Strings(keys)",
        "ordered := map[string][]string{}",
        "for _, key := range keys {",
        "\tordered[key] = groups[key]",
        "}",
        "return ordered"
      ]),
      scala: scala("groupByFirstLetter", "words: Seq[String]", "Map[String, Seq[String]]", [
        "val groups = scala.collection.mutable.Map.empty[String, scala.collection.mutable.ArrayBuffer[String]]",
        "for (word <- words if word.nonEmpty) {",
        "  val key = word.charAt(0).toString",
        "  groups.getOrElseUpdate(key, scala.collection.mutable.ArrayBuffer.empty[String]).append(word)",
        "}",
        "groups.toSeq.sortBy(_._1).map { case (key, values) => key -> values.toSeq }.toMap"
      ])
    }
  },
  "hashing-bonus-09": {
    signature: {
      name: "canFormWord",
      inputs: [
        { name: "word", type: { type: "string" } },
        { name: "letters", type: arrayOfStrings() }
      ],
      output: { type: "boolean" }
    },
    languages: {
      python: py("can_form_word", "word: str, letters: list[str]", "bool", [
        "counts = {}",
        "for letter in letters:",
        "    counts[letter] = counts.get(letter, 0) + 1",
        "for char in word:",
        "    if counts.get(char, 0) == 0:",
        "        return False",
        "    counts[char] -= 1",
        "return True"
      ]),
      typescript: ts("canFormWord", "word: string, letters: string[]", "boolean", [
        "const counts = new Map<string, number>();",
        "for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1);",
        "for (const char of word) {",
        "  const available = counts.get(char) ?? 0;",
        "  if (available === 0) return false;",
        "  counts.set(char, available - 1);",
        "}",
        "return true;"
      ]),
      go: go("CanFormWord", "word string, letters []string", "bool", [
        "counts := map[rune]int{}",
        "for _, letter := range letters {",
        "\tchars := []rune(letter)",
        "\tif len(chars) > 0 {",
        "\t\tcounts[chars[0]]++",
        "\t}",
        "}",
        "for _, char := range word {",
        "\tif counts[char] == 0 {",
        "\t\treturn false",
        "\t}",
        "\tcounts[char]--",
        "}",
        "return true"
      ]),
      scala: scala("canFormWord", "word: String, letters: Seq[String]", "Boolean", [
        "val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)",
        "for (letter <- letters if letter.nonEmpty) counts(letter.charAt(0)) = counts(letter.charAt(0)) + 1",
        "for (char <- word) {",
        "  if (counts(char) == 0) return false",
        "  counts(char) = counts(char) - 1",
        "}",
        "true"
      ])
    }
  },
  "hashing-bonus-10": simpleArrayNumber("longestBalancedPrefix", "bits", [
    "const firstSeen = new Map<number, number>([[0, -1]]);",
    "let balance = 0;",
    "let best = 0;",
    "for (let index = 0; index < bits.length; index += 1) {",
    "  balance += bits[index] === 1 ? 1 : -1;",
    "  if (firstSeen.has(balance)) {",
    "    best = Math.max(best, index - firstSeen.get(balance)!);",
    "  } else {",
    "    firstSeen.set(balance, index);",
    "  }",
    "}",
    "return best;"
  ], [
    "first_seen = {0: -1}",
    "balance = 0",
    "best = 0",
    "for index, bit in enumerate(bits):",
    "    balance += 1 if bit == 1 else -1",
    "    if balance in first_seen:",
    "        best = max(best, index - first_seen[balance])",
    "    else:",
    "        first_seen[balance] = index",
    "return best"
  ], [
    "firstSeen := map[int]int{0: -1}",
    "balance := 0",
    "best := 0",
    "for index, bit := range bits {",
    "\tif bit == 1 {",
    "\t\tbalance++",
    "\t} else {",
    "\t\tbalance--",
    "\t}",
    "\tif previous, ok := firstSeen[balance]; ok {",
    "\t\tlength := index - previous",
    "\t\tif length > best {",
    "\t\t\tbest = length",
    "\t\t}",
    "\t} else {",
    "\t\tfirstSeen[balance] = index",
    "\t}",
    "}",
    "return best"
  ], [
    "val firstSeen = scala.collection.mutable.Map(0 -> -1)",
    "var balance = 0",
    "var best = 0",
    "for ((bit, index) <- bits.zipWithIndex) {",
    "  balance += (if (bit == 1) 1 else -1)",
    "  firstSeen.get(balance) match {",
    "    case Some(previous) => best = math.max(best, index - previous)",
    "    case None => firstSeen(balance) = index",
    "  }",
    "}",
    "best"
  ], "LongestBalancedPrefix"),
  "hashing-bonus-11": simpleArrayNumber("countDistinctPairSums", "nums", [
    "const sums = new Set<number>();",
    "for (let left = 0; left < nums.length; left += 1) {",
    "  for (let right = left + 1; right < nums.length; right += 1) {",
    "    sums.add(nums[left] + nums[right]);",
    "  }",
    "}",
    "return sums.size;"
  ], [
    "sums = set()",
    "for left in range(len(nums)):",
    "    for right in range(left + 1, len(nums)):",
    "        sums.add(nums[left] + nums[right])",
    "return len(sums)"
  ], [
    "sums := map[int]bool{}",
    "for left := 0; left < len(nums); left++ {",
    "\tfor right := left + 1; right < len(nums); right++ {",
    "\t\tsums[nums[left]+nums[right]] = true",
    "\t}",
    "}",
    "return len(sums)"
  ], [
    "val sums = scala.collection.mutable.Set.empty[Int]",
    "for (left <- nums.indices) {",
    "  for (right <- left + 1 until nums.length) sums.add(nums(left) + nums(right))",
    "}",
    "sums.size"
  ], "CountDistinctPairSums"),
  "hashing-bonus-12": {
    signature: {
      name: "isomorphicStrings",
      inputs: [
        { name: "source", type: { type: "string" } },
        { name: "target", type: { type: "string" } }
      ],
      output: { type: "boolean" }
    },
    languages: {
      python: py("isomorphic_strings", "source: str, target: str", "bool", [
        "if len(source) != len(target):",
        "    return False",
        "forward = {}",
        "used = set()",
        "for left, right in zip(source, target):",
        "    if left in forward:",
        "        if forward[left] != right:",
        "            return False",
        "    else:",
        "        if right in used:",
        "            return False",
        "        forward[left] = right",
        "        used.add(right)",
        "return True"
      ]),
      typescript: ts("isomorphicStrings", "source: string, target: string", "boolean", [
        "if (source.length !== target.length) return false;",
        "const forward = new Map<string, string>();",
        "const used = new Set<string>();",
        "for (let index = 0; index < source.length; index += 1) {",
        "  const left = source[index];",
        "  const right = target[index];",
        "  if (forward.has(left)) {",
        "    if (forward.get(left) !== right) return false;",
        "  } else {",
        "    if (used.has(right)) return false;",
        "    forward.set(left, right);",
        "    used.add(right);",
        "  }",
        "}",
        "return true;"
      ]),
      go: go("IsomorphicStrings", "source string, target string", "bool", [
        "leftChars := []rune(source)",
        "rightChars := []rune(target)",
        "if len(leftChars) != len(rightChars) {",
        "\treturn false",
        "}",
        "forward := map[rune]rune{}",
        "used := map[rune]bool{}",
        "for index, left := range leftChars {",
        "\tright := rightChars[index]",
        "\tif mapped, ok := forward[left]; ok {",
        "\t\tif mapped != right {",
        "\t\t\treturn false",
        "\t\t}",
        "\t} else {",
        "\t\tif used[right] {",
        "\t\t\treturn false",
        "\t\t}",
        "\t\tforward[left] = right",
        "\t\tused[right] = true",
        "\t}",
        "}",
        "return true"
      ]),
      scala: scala("isomorphicStrings", "source: String, target: String", "Boolean", [
        "if (source.length != target.length) return false",
        "val forward = scala.collection.mutable.Map.empty[Char, Char]",
        "val used = scala.collection.mutable.Set.empty[Char]",
        "for (index <- source.indices) {",
        "  val left = source.charAt(index)",
        "  val right = target.charAt(index)",
        "  forward.get(left) match {",
        "    case Some(mapped) => if (mapped != right) return false",
        "    case None =>",
        "      if (used.contains(right)) return false",
        "      forward(left) = right",
        "      used.add(right)",
        "  }",
        "}",
        "true"
      ])
    }
  }
};

function simpleArrayNumber(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number", tsBody),
      go: go(goName, `${argName} []int`, "int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Int", scalaBody)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "py",
    starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`,
    reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n`
  };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "ts",
    starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`,
    reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n`
  };
}

function go(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
  };
}

function goWithImport(name: string, args: string, returnType: string, imports: string[], body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nimport (\n${indent(imports, "\t")}\n)\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
  };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n`
  };
}

function arrayOfNumbers() {
  return { type: "array" as const, items: { type: "number" as const } };
}

function arrayOfStrings() {
  return { type: "array" as const, items: { type: "string" as const } };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

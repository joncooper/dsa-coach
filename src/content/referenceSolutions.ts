export const guidedReferenceCode = String.raw`
from collections import Counter, defaultdict, deque
import bisect
import heapq
import math

def sum_positive_readings(readings):
    return sum(x for x in readings if x > 0)

def first_repeated_index(values):
    seen = set()
    for i, value in enumerate(values):
        if value in seen:
            return i
        seen.add(value)
    return -1

def count_safe_windows(nums, k, limit):
    if k <= 0 or k > len(nums):
        return 0
    current = sum(nums[:k])
    total = 1 if current <= limit else 0
    for right in range(k, len(nums)):
        current += nums[right] - nums[right - k]
        if current <= limit:
            total += 1
    return total

def longest_true_run(flags):
    best = current = 0
    for flag in flags:
        current = current + 1 if flag else 0
        best = max(best, current)
    return best

def recursive_digit_sum(n):
    if n < 10:
        return n
    return n % 10 + recursive_digit_sum(n // 10)

def halve_step_count(n):
    steps = 0
    while n > 0:
        n //= 2
        steps += 1
    return steps

def rotate_left(nums, k):
    if not nums:
        return []
    k %= len(nums)
    return nums[k:] + nums[:k]

def compress_runs(text):
    if not text:
        return ""
    out = []
    current = text[0]
    count = 1
    for ch in text[1:]:
        if ch == current:
            count += 1
        else:
            out.append(f"{current}{count}")
            current, count = ch, 1
    out.append(f"{current}{count}")
    return "".join(out)

def merge_sorted_unique(a, b):
    i = j = 0
    out = []
    while i < len(a) or j < len(b):
        if j == len(b) or (i < len(a) and a[i] <= b[j]):
            value = a[i]
            i += 1
        else:
            value = b[j]
            j += 1
        if not out or out[-1] != value:
            out.append(value)
    return out

def minimum_average_gap_index(nums):
    total = sum(nums)
    left = 0
    best_index = 0
    best_gap = None
    for i, value in enumerate(nums):
        left += value
        left_avg = left // (i + 1)
        right_count = len(nums) - i - 1
        right_avg = 0 if right_count == 0 else (total - left) // right_count
        gap = abs(left_avg - right_avg)
        if best_gap is None or gap < best_gap:
            best_gap = gap
            best_index = i
    return best_index

def product_except_self_local(nums):
    out = [1] * len(nums)
    prefix = 1
    for i, value in enumerate(nums):
        out[i] = prefix
        prefix *= value
    suffix = 1
    for i in range(len(nums) - 1, -1, -1):
        out[i] *= suffix
        suffix *= nums[i]
    return out

def longest_balanced_prefix(text):
    balance = 0
    best = 0
    for i, ch in enumerate(text):
        balance += 1 if ch == "A" else -1
        if balance == 0:
            best = i + 1
    return best

def closest_pair_sum(nums, target):
    left, right = 0, len(nums) - 1
    best = nums[left] + nums[right]
    while left < right:
        current = nums[left] + nums[right]
        if abs(current - target) < abs(best - target) or (abs(current - target) == abs(best - target) and current < best):
            best = current
        if current < target:
            left += 1
        else:
            right -= 1
    return best

def trim_adjacent_pairs(text):
    stack = []
    for ch in text:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)

def max_sum_under_limit(nums, limit):
    left = current = best = 0
    for right, value in enumerate(nums):
        current += value
        while left <= right and current > limit:
            current -= nums[left]
            left += 1
        best = max(best, current)
    return best

def longest_with_flips(bits, k):
    left = zeroes = best = 0
    for right, bit in enumerate(bits):
        if bit == 0:
            zeroes += 1
        while zeroes > k:
            if bits[left] == 0:
                zeroes -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

def palindrome_edge_score(text):
    left, right = 0, len(text) - 1
    pairs = 0
    while left < right and text[left] == text[right]:
        pairs += 1
        left += 1
        right -= 1
    return pairs

def sorted_squares_local(nums):
    left, right = 0, len(nums) - 1
    out = [0] * len(nums)
    write = len(nums) - 1
    while left <= right:
        if abs(nums[left]) > abs(nums[right]):
            out[write] = nums[left] * nums[left]
            left += 1
        else:
            out[write] = nums[right] * nums[right]
            right -= 1
        write -= 1
    return out

def pairable_remainders(nums, k):
    if len(nums) % 2:
        return False
    counts = Counter(x % k for x in nums)
    for r, count in counts.items():
        complement = (-r) % k
        if complement == r:
            if count % 2:
                return False
        elif counts[complement] != count:
            return False
    return True

def first_unique_token(tokens):
    counts = Counter(tokens)
    for token in tokens:
        if counts[token] == 1:
            return token
    return ""

def anagram_bucket_sizes(words):
    buckets = Counter("".join(sorted(word)) for word in words)
    return sorted(buckets.values())

def longest_distinct_span(text):
    last = {}
    left = best = 0
    for right, ch in enumerate(text):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best

def count_target_sum_subarrays(nums, target):
    counts = Counter({0: 1})
    prefix = total = 0
    for value in nums:
        prefix += value
        total += counts[prefix - target]
        counts[prefix] += 1
    return total

def common_customers(morning, evening):
    return len(set(morning) & set(evening))

def list_sum(head):
    total = 0
    while head:
        total += head.val
        head = head.next
    return total

def remove_list_value(head, target):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == target:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next

def middle_list_value(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return None if slow is None else slow.val

def merge_two_linked_lists(a, b):
    dummy = ListNode()
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

def palindrome_linked_list_local(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    return values == values[::-1]

def balanced_brackets_local(text):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in text:
        if ch in pairs.values():
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

def warmer_day_waits(temps):
    out = [0] * len(temps)
    stack = []
    for i, temp in enumerate(temps):
        while stack and temps[stack[-1]] < temp:
            prev = stack.pop()
            out[prev] = i - prev
        stack.append(i)
    return out

def simplify_folder_steps(steps):
    stack = []
    for step in steps:
        if step == ".":
            continue
        if step == "..":
            if stack:
                stack.pop()
        else:
            stack.append(step)
    return "/" + "/".join(stack)

def recent_event_counts(events, window):
    q = deque()
    out = []
    for event in events:
        q.append(event)
        while q and q[0] < event - window:
            q.popleft()
        out.append(len(q))
    return out

def next_greater_values(nums):
    out = [-1] * len(nums)
    stack = []
    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            out[stack.pop()] = value
        stack.append(i)
    return out

def tree_max_depth_local(root):
    if not root:
        return 0
    return 1 + max(tree_max_depth_local(root.left), tree_max_depth_local(root.right))

def tree_level_sums(root):
    if not root:
        return []
    q = deque([root])
    out = []
    while q:
        total = 0
        for _ in range(len(q)):
            node = q.popleft()
            total += node.val
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(total)
    return out

def tree_has_path_sum_local(root, target):
    if not root:
        return False
    if not root.left and not root.right:
        return root.val == target
    return tree_has_path_sum_local(root.left, target - root.val) or tree_has_path_sum_local(root.right, target - root.val)

def count_grid_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    visited = set()
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != 1 or (r, c) in visited:
            return
        visited.add((r, c))
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in visited:
                count += 1
                dfs(r, c)
    return count

def shortest_edge_path(n, edges, start, goal):
    if start == goal:
        return 0
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    q = deque([(start, 0)])
    seen = {start}
    while q:
        node, dist = q.popleft()
        for nxt in graph[node]:
            if nxt == goal:
                return dist + 1
            if nxt not in seen:
                seen.add(nxt)
                q.append((nxt, dist + 1))
    return -1

def can_finish_local(n, prerequisites):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for course, before in prerequisites:
        graph[before].append(course)
        indegree[course] += 1
    q = deque(i for i, deg in enumerate(indegree) if deg == 0)
    done = 0
    while q:
        node = q.popleft()
        done += 1
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
    return done == n

def connected_component_count(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    seen = set()
    count = 0
    for node in range(n):
        if node in seen:
            continue
        count += 1
        stack = [node]
        seen.add(node)
        while stack:
            current = stack.pop()
            for nxt in graph[current]:
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
    return count

def top_k_scores(scores, k):
    return sorted(scores, reverse=True)[:k]

def merge_sorted_batches(batches):
    heap = []
    for bi, batch in enumerate(batches):
        if batch:
            heapq.heappush(heap, (batch[0], bi, 0))
    out = []
    while heap:
        value, bi, i = heapq.heappop(heap)
        out.append(value)
        if i + 1 < len(batches[bi]):
            heapq.heappush(heap, (batches[bi][i + 1], bi, i + 1))
    return out

def k_closest_points_local(points, k):
    return [list(point) for _, point in sorted((x*x + y*y, [x, y]) for x, y in points)[:k]]

def running_medians_local(nums):
    lows, highs, out = [], [], []
    for num in nums:
        heapq.heappush(lows, -num)
        heapq.heappush(highs, -heapq.heappop(lows))
        if len(highs) > len(lows):
            heapq.heappush(lows, -heapq.heappop(highs))
        if len(lows) > len(highs):
            out.append(-lows[0])
        else:
            out.append((-lows[0] + highs[0]) / 2)
    return out

def combine_until_target(values, target):
    if not values:
        return -1
    heapq.heapify(values)
    steps = 0
    while values and values[0] < target:
        if len(values) < 2:
            return -1
        small = heapq.heappop(values)
        large = heapq.heappop(values)
        heapq.heappush(values, small + 2 * large)
        steps += 1
    return steps

def max_compatible_meetings(intervals):
    end = -10**18
    count = 0
    for start, finish in sorted(intervals, key=lambda x: (x[1], x[0])):
        if start >= end:
            count += 1
            end = finish
    return count

def assign_snacks(appetites, snacks):
    appetites = sorted(appetites)
    snacks = sorted(snacks)
    child = satisfied = 0
    for snack in snacks:
        if child < len(appetites) and snack >= appetites[child]:
            satisfied += 1
            child += 1
    return satisfied

def largest_one_swap(digits):
    chars = list(digits)
    last = {ch: i for i, ch in enumerate(chars)}
    for i, ch in enumerate(chars):
        for digit in "9876543210":
            if digit > ch and last.get(digit, -1) > i:
                j = last[digit]
                chars[i], chars[j] = chars[j], chars[i]
                return "".join(chars)
    return digits

def can_reach_end_local(jumps):
    farthest = 0
    for i, jump in enumerate(jumps):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
    return True

def partition_labels_local(text):
    last = {ch: i for i, ch in enumerate(text)}
    start = end = 0
    out = []
    for i, ch in enumerate(text):
        end = max(end, last[ch])
        if i == end:
            out.append(end - start + 1)
            start = i + 1
    return out

def lower_bound_local(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] >= target:
            right = mid
        else:
            left = mid + 1
    return left

def first_day_for_bouquets(bloom_days, bouquets, size):
    if bouquets * size > len(bloom_days):
        return -1
    def can(day):
        made = run = 0
        for bloom in bloom_days:
            if bloom <= day:
                run += 1
                if run == size:
                    made += 1
                    run = 0
            else:
                run = 0
        return made >= bouquets
    left, right = min(bloom_days), max(bloom_days)
    while left < right:
        mid = (left + right) // 2
        if can(mid):
            right = mid
        else:
            left = mid + 1
    return left

def integer_square_root(n):
    left, right = 0, n
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        if mid * mid <= n:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer

def search_rotated_local(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1

def ship_capacity_local(weights, days):
    def needed(capacity):
        used = 1
        load = 0
        for weight in weights:
            if load + weight > capacity:
                used += 1
                load = 0
            load += weight
        return used
    left, right = max(weights), sum(weights)
    while left < right:
        mid = (left + right) // 2
        if needed(mid) <= days:
            right = mid
        else:
            left = mid + 1
    return left

def subsets_lexicographic(nums):
    nums = sorted(nums)
    out, path = [], []
    def dfs(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return out

def unique_tile_sequence_count(tiles):
    counts = Counter(tiles)
    def dfs():
        total = 0
        for ch in list(counts):
            if counts[ch] == 0:
                continue
            counts[ch] -= 1
            total += 1 + dfs()
            counts[ch] += 1
        return total
    return dfs()

def combination_sum_exact_local(nums, target):
    nums = sorted(nums)
    out, path = [], []
    def dfs(start, remaining):
        if remaining == 0:
            out.append(path[:])
            return
        prev = None
        for i in range(start, len(nums)):
            if nums[i] == prev:
                continue
            if nums[i] > remaining:
                break
            prev = nums[i]
            path.append(nums[i])
            dfs(i + 1, remaining - nums[i])
            path.pop()
    dfs(0, target)
    return out

def generate_parentheses_local(n):
    out = []
    def dfs(opened, closed, path):
        if len(path) == 2 * n:
            out.append(path)
            return
        if opened < n:
            dfs(opened + 1, closed, path + "(")
        if closed < opened:
            dfs(opened, closed + 1, path + ")")
    dfs(0, 0, "")
    return out

def word_path_exists_local(board, word):
    if word == "":
        return True
    rows = len(board)
    cols = len(board[0]) if rows else 0
    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        saved = board[r][c]
        board[r][c] = "#"
        found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)
        board[r][c] = saved
        return found
    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))

def climb_with_blocks(n, blocks):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = sum(dp[i - block] for block in blocks if i - block >= 0)
    return dp[n]

def min_cost_steps_local(cost):
    prev2 = prev1 = 0
    for i in range(2, len(cost) + 1):
        prev2, prev1 = prev1, min(prev1 + cost[i - 1], prev2 + cost[i - 2])
    return prev1

def max_non_adjacent_local(nums):
    prev2 = prev1 = 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1

def coin_change_min_local(coins, amount):
    inf = amount + 1
    dp = [0] + [inf] * amount
    for value in range(1, amount + 1):
        dp[value] = min([inf] + [1 + dp[value - coin] for coin in coins if value >= coin and dp[value - coin] != inf])
    return -1 if dp[amount] == inf else dp[amount]

def lis_length_local(nums):
    tails = []
    for num in nums:
        i = bisect.bisect_left(tails, num)
        if i == len(tails):
            tails.append(num)
        else:
            tails[i] = num
    return len(tails)

def grid_paths_with_blocks(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    dp = [0] * cols
    dp[0] = 0 if grid[0][0] == 1 else 1
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                dp[c] = 0
            elif c > 0:
                dp[c] += dp[c - 1]
    return dp[-1]

def growth_label(operations):
    if len(operations) < 2 or any(value == 0 for value in operations[:-1]):
        return "unknown"
    ratios = [operations[i + 1] / operations[i] for i in range(len(operations) - 1)]
    avg = sum(ratios) / len(ratios)
    if 0.75 <= avg <= 1.35:
        return "constant"
    if 1.55 <= avg <= 2.45:
        return "linear"
    if 3.1 <= avg <= 5.0:
        return "quadratic"
    return "unknown"

def choose_pattern_label(features):
    words = {str(feature).lower() for feature in features}
    joined = " ".join(words)
    if any(key in joined for key in ["node", "edge", "shortest", "connected"]):
        return "graph"
    if any(key in joined for key in ["subproblem", "reuse", "minimum", "optimal"]):
        return "dp"
    if any(key in joined for key in ["sorted", "boundary", "answer"]):
        return "binary-search"
    if any(key in joined for key in ["contiguous", "window", "at most", "positive"]):
        return "sliding-window"
    return "hashing"

def mixed_review_score(results):
    return sum(difficulty for difficulty, passed in results if passed)
`;

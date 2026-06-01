import { LIBRARY_ASYNCIO_SET_ID, libraryProblem } from "./_shared";

const make = libraryProblem(LIBRARY_ASYNCIO_SET_ID);

const collectReadings = make({
  id: "tek-async-collect-readings",
  title: "Collect Sensor Readings with `gather`",
  difficulty: "easy",
  patterns: ["async/await", "asyncio.gather", "fan-out/fan-in"],
  entrypoint: "collect_readings",
  prompt:
    "Implement an async function that reads many sensors concurrently. Each sensor is a dict with `id`, `value`, and `delay_ms`. Simulate the sensor I/O by awaiting `asyncio.sleep(delay_ms / 1000)`, then return a dict with that sensor's `id` and `value`. `collect_readings` should start all reads before awaiting the combined result, and the final list must preserve the original sensor order.",
  constraints: [
    "Define `collect_readings` with `async def`.",
    "0 <= len(sensors) <= 1000.",
    "`delay_ms` is a non-negative integer; tests use small delays.",
    "Return one `{id, value}` dict per sensor in the same order as the input.",
    "An empty input returns an empty list."
  ],
  examples: [
    {
      name: "preserves input order",
      args: [[
        { id: "slow", value: 10, delay_ms: 3 },
        { id: "fast", value: 20, delay_ms: 1 }
      ]],
      expected: [
        { id: "slow", value: 10 },
        { id: "fast", value: 20 }
      ]
    }
  ],
  starterCode:
    "import asyncio\n\n" +
    "async def collect_readings(sensors):\n" +
    "    async def read_sensor(sensor):\n" +
    "        # Simulate asynchronous I/O with asyncio.sleep(...).\n" +
    "        pass\n" +
    "\n" +
    "    # Start every read, then await all results while preserving input order.\n" +
    "    pass\n",
  referenceCode:
    "import asyncio\n\n" +
    "async def collect_readings(sensors):\n" +
    "    async def read_sensor(sensor):\n" +
    "        await asyncio.sleep(sensor[\"delay_ms\"] / 1000)\n" +
    "        return {\"id\": sensor[\"id\"], \"value\": sensor[\"value\"]}\n" +
    "\n" +
    "    tasks = [read_sensor(sensor) for sensor in sensors]\n" +
    "    return list(await asyncio.gather(*tasks))\n",
  solutionCode:
    "import asyncio\n\n" +
    "async def collect_readings(sensors):\n" +
    "    async def read_sensor(sensor):\n" +
    "        await asyncio.sleep(sensor[\"delay_ms\"] / 1000)\n" +
    "        return {\"id\": sensor[\"id\"], \"value\": sensor[\"value\"]}\n" +
    "\n" +
    "    tasks = [asyncio.create_task(read_sensor(sensor)) for sensor in sensors]\n" +
    "    return list(await asyncio.gather(*tasks))\n",
  visibleTests: [
    { name: "empty", args: [[]], expected: [] },
    {
      name: "single sensor",
      args: [[{ id: "temp", value: 72, delay_ms: 0 }]],
      expected: [{ id: "temp", value: 72 }]
    },
    {
      name: "preserves input order",
      args: [[
        { id: "slow", value: 10, delay_ms: 3 },
        { id: "fast", value: 20, delay_ms: 1 }
      ]],
      expected: [
        { id: "slow", value: 10 },
        { id: "fast", value: 20 }
      ]
    }
  ],
  hiddenTests: [
    {
      name: "three sensors reverse latency",
      args: [[
        { id: "a", value: 1, delay_ms: 3 },
        { id: "b", value: 2, delay_ms: 2 },
        { id: "c", value: 3, delay_ms: 1 }
      ]],
      expected: [
        { id: "a", value: 1 },
        { id: "b", value: 2 },
        { id: "c", value: 3 }
      ]
    },
    {
      name: "zero delays",
      args: [[
        { id: "x", value: "alpha", delay_ms: 0 },
        { id: "y", value: "beta", delay_ms: 0 }
      ]],
      expected: [
        { id: "x", value: "alpha" },
        { id: "y", value: "beta" }
      ]
    },
    {
      name: "mixed value types",
      args: [[
        { id: "ok", value: true, delay_ms: 1 },
        { id: "count", value: 5, delay_ms: 2 },
        { id: "label", value: "ready", delay_ms: 0 }
      ]],
      expected: [
        { id: "ok", value: true },
        { id: "count", value: 5 },
        { id: "label", value: "ready" }
      ]
    },
    {
      name: "larger batch",
      args: [[
        { id: "s1", value: 11, delay_ms: 1 },
        { id: "s2", value: 22, delay_ms: 3 },
        { id: "s3", value: 33, delay_ms: 2 },
        { id: "s4", value: 44, delay_ms: 0 }
      ]],
      expected: [
        { id: "s1", value: 11 },
        { id: "s2", value: 22 },
        { id: "s3", value: 33 },
        { id: "s4", value: 44 }
      ]
    }
  ],
  hints: [
    "`asyncio.gather` returns results in the same order as the awaitables you pass in.",
    "Calling an async function creates a coroutine; it does not run to completion until it is awaited or scheduled.",
    "You can pass coroutines directly to `gather`, or wrap them with `asyncio.create_task` first."
  ],
  solution:
    "Define an async helper for one sensor, then build one awaitable per input sensor and pass them all to `asyncio.gather`. Since `gather` preserves awaitable order, no extra index bookkeeping is needed.",
  walkthrough:
    "The helper awaits the simulated latency and returns the normalized reading. `collect_readings` creates all helper coroutines before awaiting, which lets the event loop interleave their sleeps. The final `await asyncio.gather(...)` resumes when every read has completed and returns the values in input order.",
  followUps: [
    "How would you handle one sensor raising an exception without losing every other successful reading?",
    "When would you prefer `create_task` over passing bare coroutines to `gather`?"
  ],
  complexity: { time: "O(n) scheduled work; wall-clock is bounded by the slowest sensor delay", space: "O(n)" }
});

const completionOrder = make({
  id: "tek-async-completion-order",
  title: "Report Jobs in Completion Order",
  difficulty: "easy",
  patterns: ["asyncio.as_completed", "task scheduling", "completion order"],
  entrypoint: "completion_order",
  prompt:
    "Implement an async function that starts all jobs concurrently and reports each result as soon as that job finishes. Each job is a dict with `name`, `result`, and `delay_ms`. Simulate the job by awaiting `asyncio.sleep(delay_ms / 1000)`, then returning `{name, result}`. Unlike `gather`, the final list should be ordered by completion time, not by the input order. Test cases use distinct delays so completion order is deterministic.",
  constraints: [
    "Define `completion_order` with `async def`.",
    "0 <= len(jobs) <= 1000.",
    "`delay_ms` values are distinct within a test case.",
    "Start all jobs before collecting completed results.",
    "Return one `{name, result}` dict per job."
  ],
  examples: [
    {
      name: "fast job first",
      args: [[
        { name: "slow", result: "S", delay_ms: 4 },
        { name: "fast", result: "F", delay_ms: 1 }
      ]],
      expected: [
        { name: "fast", result: "F" },
        { name: "slow", result: "S" }
      ]
    }
  ],
  starterCode:
    "import asyncio\n\n" +
    "async def completion_order(jobs):\n" +
    "    async def run_job(job):\n" +
    "        # Simulate work, then return {'name': ..., 'result': ...}.\n" +
    "        pass\n" +
    "\n" +
    "    # Schedule all jobs, then consume them as each finishes.\n" +
    "    pass\n",
  referenceCode:
    "import asyncio\n\n" +
    "async def completion_order(jobs):\n" +
    "    async def run_job(job):\n" +
    "        await asyncio.sleep(job[\"delay_ms\"] / 1000)\n" +
    "        return {\"name\": job[\"name\"], \"result\": job[\"result\"]}\n" +
    "\n" +
    "    tasks = [asyncio.create_task(run_job(job)) for job in jobs]\n" +
    "    results = []\n" +
    "    for task in asyncio.as_completed(tasks):\n" +
    "        results.append(await task)\n" +
    "    return results\n",
  solutionCode:
    "import asyncio\n\n" +
    "async def completion_order(jobs):\n" +
    "    async def run_job(job):\n" +
    "        await asyncio.sleep(job[\"delay_ms\"] / 1000)\n" +
    "        return {\"name\": job[\"name\"], \"result\": job[\"result\"]}\n" +
    "\n" +
    "    pending = [asyncio.create_task(run_job(job)) for job in jobs]\n" +
    "    ordered = []\n" +
    "    for finished in asyncio.as_completed(pending):\n" +
    "        ordered.append(await finished)\n" +
    "    return ordered\n",
  visibleTests: [
    { name: "empty", args: [[]], expected: [] },
    {
      name: "single job",
      args: [[{ name: "only", result: 1, delay_ms: 0 }]],
      expected: [{ name: "only", result: 1 }]
    },
    {
      name: "fast job first",
      args: [[
        { name: "slow", result: "S", delay_ms: 4 },
        { name: "fast", result: "F", delay_ms: 1 }
      ]],
      expected: [
        { name: "fast", result: "F" },
        { name: "slow", result: "S" }
      ]
    }
  ],
  hiddenTests: [
    {
      name: "middle input finishes first",
      args: [[
        { name: "a", result: "A", delay_ms: 5 },
        { name: "b", result: "B", delay_ms: 1 },
        { name: "c", result: "C", delay_ms: 3 }
      ]],
      expected: [
        { name: "b", result: "B" },
        { name: "c", result: "C" },
        { name: "a", result: "A" }
      ]
    },
    {
      name: "already sorted by latency",
      args: [[
        { name: "one", result: 1, delay_ms: 1 },
        { name: "two", result: 2, delay_ms: 2 },
        { name: "three", result: 3, delay_ms: 3 }
      ]],
      expected: [
        { name: "one", result: 1 },
        { name: "two", result: 2 },
        { name: "three", result: 3 }
      ]
    },
    {
      name: "reverse input latency",
      args: [[
        { name: "first", result: "first", delay_ms: 6 },
        { name: "second", result: "second", delay_ms: 4 },
        { name: "third", result: "third", delay_ms: 2 },
        { name: "fourth", result: "fourth", delay_ms: 1 }
      ]],
      expected: [
        { name: "fourth", result: "fourth" },
        { name: "third", result: "third" },
        { name: "second", result: "second" },
        { name: "first", result: "first" }
      ]
    }
  ],
  hints: [
    "`asyncio.gather` is the wrong collector when you need completion order.",
    "Create tasks first so every job is already running before you iterate over `asyncio.as_completed`.",
    "Each item produced by `as_completed` is awaitable; await it to get that job's result."
  ],
  solution:
    "Create one task per job, then loop over `asyncio.as_completed(tasks)`. Awaiting each completed task yields the next finished job, so appending in that loop builds the result list in completion order.",
  walkthrough:
    "The important separation is scheduling versus collection. First every job is turned into a task, giving the event loop the full batch. Then `as_completed` yields awaitables in finish order. Because the tests use distinct delays, the completion order is stable and independent of input position.",
  followUps: [
    "How would the function change if jobs with the same delay needed input-order tie breaking?",
    "How would you stream each completed result to a caller instead of building a list?"
  ],
  complexity: { time: "O(n) scheduled work plus job latency", space: "O(n)" }
});

const boundedCrawl = make({
  id: "tek-async-bounded-crawl",
  title: "Bound an Async Crawl with a Semaphore",
  difficulty: "medium",
  patterns: ["asyncio.Semaphore", "bounded concurrency", "shared async state"],
  entrypoint: "bounded_crawl",
  prompt:
    "Implement an async crawler simulation with a global concurrency limit. Each page is a dict with `url`, `bytes`, and `delay_ms`. Start one task per page, but use `asyncio.Semaphore` so no more than `limit` pages are being fetched at the same time. Return a dict with the input-order list of fetched `urls`, the `total_bytes`, and the largest number of simultaneous in-flight fetches observed as `max_in_flight`.",
  constraints: [
    "Define `bounded_crawl` with `async def`.",
    "0 <= len(pages) <= 1000.",
    "If `limit <= 0`, treat it as `1`.",
    "Return URLs in the original input order even though fetches run concurrently.",
    "Use a semaphore to guard the simulated fetch section."
  ],
  examples: [
    {
      name: "limit two",
      args: [[
        { url: "/a", bytes: 10, delay_ms: 3 },
        { url: "/b", bytes: 20, delay_ms: 3 },
        { url: "/c", bytes: 30, delay_ms: 1 }
      ], 2],
      expected: { urls: ["/a", "/b", "/c"], total_bytes: 60, max_in_flight: 2 }
    }
  ],
  starterCode:
    "import asyncio\n\n" +
    "async def bounded_crawl(pages, limit):\n" +
    "    # Use asyncio.Semaphore to cap the number of simultaneous fetches.\n" +
    "    # Return {'urls': [...], 'total_bytes': ..., 'max_in_flight': ...}.\n" +
    "    pass\n",
  referenceCode:
    "import asyncio\n\n" +
    "async def bounded_crawl(pages, limit):\n" +
    "    limit = max(1, limit)\n" +
    "    semaphore = asyncio.Semaphore(limit)\n" +
    "    active = 0\n" +
    "    max_seen = 0\n" +
    "    state_lock = asyncio.Lock()\n" +
    "\n" +
    "    async def fetch(index, page):\n" +
    "        nonlocal active, max_seen\n" +
    "        async with semaphore:\n" +
    "            async with state_lock:\n" +
    "                active += 1\n" +
    "                max_seen = max(max_seen, active)\n" +
    "            await asyncio.sleep(page[\"delay_ms\"] / 1000)\n" +
    "            async with state_lock:\n" +
    "                active -= 1\n" +
    "            return index, page[\"url\"], page[\"bytes\"]\n" +
    "\n" +
    "    results = await asyncio.gather(*(fetch(index, page) for index, page in enumerate(pages)))\n" +
    "    results.sort(key=lambda item: item[0])\n" +
    "    return {\n" +
    "        \"urls\": [url for _, url, _ in results],\n" +
    "        \"total_bytes\": sum(size for _, _, size in results),\n" +
    "        \"max_in_flight\": max_seen,\n" +
    "    }\n",
  solutionCode:
    "import asyncio\n\n" +
    "async def bounded_crawl(pages, limit):\n" +
    "    semaphore = asyncio.Semaphore(max(1, limit))\n" +
    "    lock = asyncio.Lock()\n" +
    "    active = 0\n" +
    "    max_in_flight = 0\n" +
    "\n" +
    "    async def fetch(index, page):\n" +
    "        nonlocal active, max_in_flight\n" +
    "        async with semaphore:\n" +
    "            async with lock:\n" +
    "                active += 1\n" +
    "                max_in_flight = max(max_in_flight, active)\n" +
    "            await asyncio.sleep(page[\"delay_ms\"] / 1000)\n" +
    "            async with lock:\n" +
    "                active -= 1\n" +
    "            return index, page[\"url\"], page[\"bytes\"]\n" +
    "\n" +
    "    fetched = await asyncio.gather(*(fetch(i, page) for i, page in enumerate(pages)))\n" +
    "    fetched.sort(key=lambda item: item[0])\n" +
    "    return {\n" +
    "        \"urls\": [url for _, url, _ in fetched],\n" +
    "        \"total_bytes\": sum(byte_count for _, _, byte_count in fetched),\n" +
    "        \"max_in_flight\": max_in_flight,\n" +
    "    }\n",
  visibleTests: [
    { name: "empty", args: [[], 3], expected: { urls: [], total_bytes: 0, max_in_flight: 0 } },
    {
      name: "limit one is sequential",
      args: [[
        { url: "/a", bytes: 10, delay_ms: 1 },
        { url: "/b", bytes: 20, delay_ms: 1 }
      ], 1],
      expected: { urls: ["/a", "/b"], total_bytes: 30, max_in_flight: 1 }
    },
    {
      name: "limit two",
      args: [[
        { url: "/a", bytes: 10, delay_ms: 3 },
        { url: "/b", bytes: 20, delay_ms: 3 },
        { url: "/c", bytes: 30, delay_ms: 1 }
      ], 2],
      expected: { urls: ["/a", "/b", "/c"], total_bytes: 60, max_in_flight: 2 }
    }
  ],
  hiddenTests: [
    {
      name: "limit larger than batch",
      args: [[
        { url: "/one", bytes: 5, delay_ms: 2 },
        { url: "/two", bytes: 7, delay_ms: 2 },
        { url: "/three", bytes: 9, delay_ms: 2 }
      ], 10],
      expected: { urls: ["/one", "/two", "/three"], total_bytes: 21, max_in_flight: 3 }
    },
    {
      name: "nonpositive limit becomes one",
      args: [[
        { url: "/x", bytes: 1, delay_ms: 1 },
        { url: "/y", bytes: 2, delay_ms: 1 },
        { url: "/z", bytes: 3, delay_ms: 1 }
      ], 0],
      expected: { urls: ["/x", "/y", "/z"], total_bytes: 6, max_in_flight: 1 }
    },
    {
      name: "preserves input order despite latency",
      args: [[
        { url: "/slow", bytes: 100, delay_ms: 5 },
        { url: "/fast", bytes: 1, delay_ms: 1 },
        { url: "/middle", bytes: 10, delay_ms: 3 },
        { url: "/last", bytes: 20, delay_ms: 2 }
      ], 3],
      expected: { urls: ["/slow", "/fast", "/middle", "/last"], total_bytes: 131, max_in_flight: 3 }
    },
    {
      name: "two waves",
      args: [[
        { url: "/a", bytes: 4, delay_ms: 3 },
        { url: "/b", bytes: 5, delay_ms: 3 },
        { url: "/c", bytes: 6, delay_ms: 3 },
        { url: "/d", bytes: 7, delay_ms: 3 },
        { url: "/e", bytes: 8, delay_ms: 3 }
      ], 2],
      expected: { urls: ["/a", "/b", "/c", "/d", "/e"], total_bytes: 30, max_in_flight: 2 }
    }
  ],
  hints: [
    "Create a semaphore with `asyncio.Semaphore(max(1, limit))` and put the simulated fetch inside `async with semaphore`.",
    "Return each task's original index so you can sort results back into input order after `gather`.",
    "The in-flight counter changes around an `await`, so protect those updates with an `asyncio.Lock`."
  ],
  solution:
    "Schedule one task per page, but make the fetch helper acquire a semaphore before incrementing the in-flight counter and sleeping. Each helper returns its original index, URL, and byte count. After `gather`, sort by index and compute the requested summary.",
  walkthrough:
    "The semaphore is the concurrency gate: tasks can exist for every page, but only `limit` of them may enter the fetch block at once. The lock keeps the active counter updates consistent around the simulated I/O. Sorting the gathered triples by their saved input index separates execution order from output order.",
  followUps: [
    "How would you enforce a separate per-host limit in addition to the global limit?",
    "What should happen to already-started tasks if one fetch raises an exception?"
  ],
  complexity: { time: "O(n log n) because results are sorted by input index after the crawl", space: "O(n)" }
});

const queuePipeline = make({
  id: "tek-async-queue-pipeline",
  title: "Build an `asyncio.Queue` Event Pipeline",
  difficulty: "medium",
  patterns: ["asyncio.Queue", "producer-consumer", "sentinel shutdown"],
  entrypoint: "normalize_events",
  prompt:
    "Implement an async producer-consumer pipeline using `asyncio.Queue`. You are given event dicts with `user`, `kind`, and `delay_ms`. A producer should enqueue every event with its original index. Several worker tasks should consume the queue, simulate per-event work with `asyncio.sleep(delay_ms / 1000)`, keep only events whose `kind` is one of `view`, `click`, or `purchase` and whose `user` is a non-empty string, and return normalized strings in original input order: `user:kind`.",
  constraints: [
    "Define `normalize_events` with `async def`.",
    "If `workers <= 0`, use one worker.",
    "Use `asyncio.Queue` for handoff between the producer and workers.",
    "Workers must shut down cleanly after all events are processed.",
    "Return accepted events in original input order, not completion order."
  ],
  examples: [
    {
      name: "filters invalid events",
      args: [[
        { user: "ada", kind: "view", delay_ms: 2 },
        { user: "", kind: "click", delay_ms: 1 },
        { user: "linus", kind: "purchase", delay_ms: 0 },
        { user: "grace", kind: "debug", delay_ms: 1 }
      ], 2],
      expected: ["ada:view", "linus:purchase"]
    }
  ],
  starterCode:
    "import asyncio\n\n" +
    "async def normalize_events(events, workers):\n" +
    "    # Use an asyncio.Queue, a producer, worker tasks, and sentinels.\n" +
    "    # Return accepted 'user:kind' strings in original input order.\n" +
    "    pass\n",
  referenceCode:
    "import asyncio\n\n" +
    "VALID_KINDS = {\"view\", \"click\", \"purchase\"}\n\n" +
    "async def normalize_events(events, workers):\n" +
    "    worker_count = max(1, workers)\n" +
    "    queue = asyncio.Queue()\n" +
    "    results = []\n" +
    "\n" +
    "    async def producer():\n" +
    "        for index, event in enumerate(events):\n" +
    "            await queue.put((index, event))\n" +
    "        for _ in range(worker_count):\n" +
    "            await queue.put(None)\n" +
    "\n" +
    "    async def worker():\n" +
    "        while True:\n" +
    "            item = await queue.get()\n" +
    "            try:\n" +
    "                if item is None:\n" +
    "                    return\n" +
    "                index, event = item\n" +
    "                await asyncio.sleep(event[\"delay_ms\"] / 1000)\n" +
    "                user = event.get(\"user\")\n" +
    "                kind = event.get(\"kind\")\n" +
    "                if isinstance(user, str) and user and kind in VALID_KINDS:\n" +
    "                    results.append((index, f\"{user}:{kind}\"))\n" +
    "            finally:\n" +
    "                queue.task_done()\n" +
    "\n" +
    "    tasks = [asyncio.create_task(worker()) for _ in range(worker_count)]\n" +
    "    await producer()\n" +
    "    await queue.join()\n" +
    "    await asyncio.gather(*tasks)\n" +
    "    return [value for _, value in sorted(results)]\n",
  solutionCode:
    "import asyncio\n\n" +
    "VALID_KINDS = {\"view\", \"click\", \"purchase\"}\n\n" +
    "async def normalize_events(events, workers):\n" +
    "    worker_count = max(1, workers)\n" +
    "    queue = asyncio.Queue()\n" +
    "    accepted = []\n" +
    "\n" +
    "    async def producer():\n" +
    "        for index, event in enumerate(events):\n" +
    "            await queue.put((index, event))\n" +
    "        for _ in range(worker_count):\n" +
    "            await queue.put(None)\n" +
    "\n" +
    "    async def consume():\n" +
    "        while True:\n" +
    "            item = await queue.get()\n" +
    "            try:\n" +
    "                if item is None:\n" +
    "                    return\n" +
    "                index, event = item\n" +
    "                await asyncio.sleep(event[\"delay_ms\"] / 1000)\n" +
    "                user = event.get(\"user\")\n" +
    "                kind = event.get(\"kind\")\n" +
    "                if isinstance(user, str) and user and kind in VALID_KINDS:\n" +
    "                    accepted.append((index, f\"{user}:{kind}\"))\n" +
    "            finally:\n" +
    "                queue.task_done()\n" +
    "\n" +
    "    consumers = [asyncio.create_task(consume()) for _ in range(worker_count)]\n" +
    "    await producer()\n" +
    "    await queue.join()\n" +
    "    await asyncio.gather(*consumers)\n" +
    "    return [value for _, value in sorted(accepted)]\n",
  visibleTests: [
    { name: "empty", args: [[], 3], expected: [] },
    {
      name: "single accepted event",
      args: [[{ user: "ada", kind: "click", delay_ms: 0 }], 1],
      expected: ["ada:click"]
    },
    {
      name: "filters invalid events",
      args: [[
        { user: "ada", kind: "view", delay_ms: 2 },
        { user: "", kind: "click", delay_ms: 1 },
        { user: "linus", kind: "purchase", delay_ms: 0 },
        { user: "grace", kind: "debug", delay_ms: 1 }
      ], 2],
      expected: ["ada:view", "linus:purchase"]
    }
  ],
  hiddenTests: [
    {
      name: "workers less than one",
      args: [[
        { user: "a", kind: "view", delay_ms: 1 },
        { user: "b", kind: "click", delay_ms: 1 }
      ], 0],
      expected: ["a:view", "b:click"]
    },
    {
      name: "preserves input order across delays",
      args: [[
        { user: "slow", kind: "view", delay_ms: 5 },
        { user: "fast", kind: "click", delay_ms: 1 },
        { user: "mid", kind: "purchase", delay_ms: 3 }
      ], 3],
      expected: ["slow:view", "fast:click", "mid:purchase"]
    },
    {
      name: "drops missing user and unknown kind",
      args: [[
        { user: "ok", kind: "view", delay_ms: 0 },
        { kind: "click", delay_ms: 0 },
        { user: "bad", kind: "trace", delay_ms: 0 },
        { user: "also-ok", kind: "purchase", delay_ms: 0 }
      ], 2],
      expected: ["ok:view", "also-ok:purchase"]
    },
    {
      name: "many events fewer workers",
      args: [[
        { user: "u1", kind: "view", delay_ms: 2 },
        { user: "u2", kind: "click", delay_ms: 2 },
        { user: "u3", kind: "purchase", delay_ms: 2 },
        { user: "u4", kind: "view", delay_ms: 2 }
      ], 2],
      expected: ["u1:view", "u2:click", "u3:purchase", "u4:view"]
    }
  ],
  hints: [
    "A common shutdown pattern is to enqueue one sentinel value, such as `None`, for each worker.",
    "Call `queue.task_done()` exactly once for every item returned by `queue.get()`, including sentinels.",
    "Workers may finish events out of order, so store each accepted value with its original index and sort at the end."
  ],
  solution:
    "Create an `asyncio.Queue`, start worker tasks, enqueue every indexed event, then enqueue one sentinel per worker. Each worker loops on `queue.get()`, handles real events, marks each item done, and returns when it sees a sentinel. The accepted results are sorted by saved index before returning.",
  walkthrough:
    "The producer is responsible for all queue input, including shutdown sentinels. Workers own the normalization logic and always call `task_done` in a `finally` block so `queue.join()` cannot hang. Because multiple workers can append results in completion order, carrying the original index is what restores deterministic output.",
  followUps: [
    "How would you add backpressure by limiting the queue's max size?",
    "How would you cancel the whole pipeline if one worker raises an unexpected exception?"
  ],
  complexity: { time: "O(n log n) because accepted events are sorted by input index", space: "O(n + workers)" }
});

const callWithRetries = make({
  id: "tek-async-timeouts-retries",
  title: "Handle Async Timeouts and Retries",
  difficulty: "medium",
  patterns: ["asyncio.wait_for", "timeouts", "retry loops"],
  entrypoint: "summarize_calls",
  prompt:
    "Implement async retry handling for a batch of remote calls. Each call has a `name` and an `attempts` list. An attempt dict has `delay_ms`, `ok`, and optionally `value`. To simulate one attempt, await `asyncio.sleep(delay_ms / 1000)`; if `ok` is false, raise an error; otherwise return `value`. Run all calls concurrently. For each call, try at most `max_retries + 1` attempts, wrapping every attempt in `asyncio.wait_for` with `timeout_ms`. Return a dict mapping each call name to the first successful value, or to the string `timeout` or `error` based on the final failed attempt.",
  constraints: [
    "Define `summarize_calls` with `async def`.",
    "`timeout_ms` is positive.",
    "`max_retries` is non-negative.",
    "A timeout counts as a failed attempt and may be retried.",
    "If a call has no attempts, record `error` for that call."
  ],
  examples: [
    {
      name: "retry after timeout",
      args: [[
        {
          name: "profile",
          attempts: [
            { delay_ms: 5, ok: true, value: "late" },
            { delay_ms: 1, ok: true, value: "fresh" }
          ]
        }
      ], 2, 1],
      expected: { profile: "fresh" }
    }
  ],
  starterCode:
    "import asyncio\n\n" +
    "async def summarize_calls(calls, timeout_ms, max_retries):\n" +
    "    async def simulate_attempt(attempt):\n" +
    "        # Sleep, then either return value or raise an error.\n" +
    "        pass\n" +
    "\n" +
    "    # Run calls concurrently; retry each call independently.\n" +
    "    pass\n",
  referenceCode:
    "import asyncio\n\n" +
    "async def summarize_calls(calls, timeout_ms, max_retries):\n" +
    "    timeout_seconds = timeout_ms / 1000\n" +
    "    max_attempts = max_retries + 1\n" +
    "\n" +
    "    async def simulate_attempt(attempt):\n" +
    "        await asyncio.sleep(attempt[\"delay_ms\"] / 1000)\n" +
    "        if not attempt.get(\"ok\", True):\n" +
    "            raise RuntimeError(\"remote call failed\")\n" +
    "        return attempt.get(\"value\")\n" +
    "\n" +
    "    async def run_one(call):\n" +
    "        last_failure = \"error\"\n" +
    "        for attempt in call.get(\"attempts\", [])[:max_attempts]:\n" +
    "            try:\n" +
    "                value = await asyncio.wait_for(simulate_attempt(attempt), timeout=timeout_seconds)\n" +
    "                return call[\"name\"], value\n" +
    "            except asyncio.TimeoutError:\n" +
    "                last_failure = \"timeout\"\n" +
    "            except Exception:\n" +
    "                last_failure = \"error\"\n" +
    "        return call[\"name\"], last_failure\n" +
    "\n" +
    "    pairs = await asyncio.gather(*(run_one(call) for call in calls))\n" +
    "    return {name: value for name, value in pairs}\n",
  solutionCode:
    "import asyncio\n\n" +
    "async def summarize_calls(calls, timeout_ms, max_retries):\n" +
    "    timeout = timeout_ms / 1000\n" +
    "    allowed = max_retries + 1\n" +
    "\n" +
    "    async def simulate_attempt(attempt):\n" +
    "        await asyncio.sleep(attempt[\"delay_ms\"] / 1000)\n" +
    "        if not attempt.get(\"ok\", True):\n" +
    "            raise RuntimeError(\"remote call failed\")\n" +
    "        return attempt.get(\"value\")\n" +
    "\n" +
    "    async def run_call(call):\n" +
    "        final_status = \"error\"\n" +
    "        for attempt in call.get(\"attempts\", [])[:allowed]:\n" +
    "            try:\n" +
    "                result = await asyncio.wait_for(simulate_attempt(attempt), timeout=timeout)\n" +
    "                return call[\"name\"], result\n" +
    "            except asyncio.TimeoutError:\n" +
    "                final_status = \"timeout\"\n" +
    "            except Exception:\n" +
    "                final_status = \"error\"\n" +
    "        return call[\"name\"], final_status\n" +
    "\n" +
    "    results = await asyncio.gather(*(run_call(call) for call in calls))\n" +
    "    return dict(results)\n",
  visibleTests: [
    { name: "empty", args: [[], 5, 1], expected: {} },
    {
      name: "first attempt succeeds",
      args: [[
        { name: "config", attempts: [{ delay_ms: 1, ok: true, value: "ok" }] }
      ], 5, 0],
      expected: { config: "ok" }
    },
    {
      name: "retry after timeout",
      args: [[
        {
          name: "profile",
          attempts: [
            { delay_ms: 5, ok: true, value: "late" },
            { delay_ms: 1, ok: true, value: "fresh" }
          ]
        }
      ], 2, 1],
      expected: { profile: "fresh" }
    }
  ],
  hiddenTests: [
    {
      name: "error then success",
      args: [[
        {
          name: "search",
          attempts: [
            { delay_ms: 1, ok: false, value: "bad" },
            { delay_ms: 1, ok: true, value: "results" }
          ]
        }
      ], 5, 1],
      expected: { search: "results" }
    },
    {
      name: "final timeout",
      args: [[
        {
          name: "slow",
          attempts: [
            { delay_ms: 4, ok: true, value: "late" },
            { delay_ms: 5, ok: true, value: "later" }
          ]
        }
      ], 1, 1],
      expected: { slow: "timeout" }
    },
    {
      name: "final error",
      args: [[
        {
          name: "broken",
          attempts: [
            { delay_ms: 1, ok: false, value: "x" },
            { delay_ms: 1, ok: false, value: "y" }
          ]
        }
      ], 5, 1],
      expected: { broken: "error" }
    },
    {
      name: "retry budget limits attempts",
      args: [[
        {
          name: "budgeted",
          attempts: [
            { delay_ms: 1, ok: false, value: "first" },
            { delay_ms: 1, ok: false, value: "second" },
            { delay_ms: 1, ok: true, value: "third" }
          ]
        }
      ], 5, 1],
      expected: { budgeted: "error" }
    },
    {
      name: "many calls run independently",
      args: [[
        { name: "a", attempts: [{ delay_ms: 1, ok: true, value: 1 }] },
        {
          name: "b",
          attempts: [
            { delay_ms: 5, ok: true, value: "late" },
            { delay_ms: 1, ok: true, value: 2 }
          ]
        },
        { name: "c", attempts: [] }
      ], 2, 1],
      expected: { a: 1, b: 2, c: "error" }
    }
  ],
  hints: [
    "Retry one call in a loop, but run the batch of calls with `asyncio.gather`.",
    "`asyncio.wait_for` raises `asyncio.TimeoutError` when the awaited operation does not finish in time.",
    "Keep a `last_failure` string so you can distinguish final timeout from final non-timeout error."
  ],
  solution:
    "Write one helper that simulates a single attempt and another that owns the retry loop for one call. The retry helper wraps each simulated attempt with `asyncio.wait_for`, returns on the first success, and remembers whether the most recent failure was a timeout or an error. The outer function gathers all per-call helpers concurrently and converts the returned pairs into a dict.",
  walkthrough:
    "Concurrency happens at the call level: every remote call gets its own retry loop task. Inside one call, attempts are sequential because the next attempt depends on the previous failure. `wait_for` handles cancellation of slow attempts for you by raising `TimeoutError`, while ordinary failed attempts are caught separately.",
  followUps: [
    "How would you add exponential backoff between attempts?",
    "How would you collect error details without exposing raw exceptions in the return value?"
  ],
  complexity: { time: "O(calls * attempted retries) scheduled work; wall-clock depends on timeout and retry paths", space: "O(calls)" }
});

export const asyncioProblems = [
  collectReadings,
  completionOrder,
  boundedCrawl,
  queuePipeline,
  callWithRetries
];

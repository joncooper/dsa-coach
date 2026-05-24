import bisect

def versioned_kv_with_snapshot(operations):
    history = {}
    table = {}
    results = []
    for op in operations:
        kind = op[0]
        if kind == "SET":
            _, key, value, ts = op
            stamps = history.setdefault(key, [])
            position = bisect.bisect_left(stamps, ts)
            if position == len(stamps) or stamps[position] != ts:
                stamps.insert(position, ts)
            table[(key, ts)] = value
        elif kind == "DELETE":
            _, key, ts = op
            stamps = history.setdefault(key, [])
            position = bisect.bisect_left(stamps, ts)
            if position == len(stamps) or stamps[position] != ts:
                stamps.insert(position, ts)
            table[(key, ts)] = None
        elif kind == "GET":
            _, key, ts = op
            stamps = history.get(key, [])
            position = bisect.bisect_right(stamps, ts)
            if position == 0:
                results.append(None)
            else:
                results.append(table[(key, stamps[position - 1])])
        elif kind == "SNAPSHOT":
            _, ts = op
            snapshot = {}
            for key, stamps in history.items():
                position = bisect.bisect_right(stamps, ts)
                if position == 0:
                    continue
                value = table[(key, stamps[position - 1])]
                if value is not None:
                    snapshot[key] = value
            results.append(snapshot)
    return results

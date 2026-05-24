def versioned_kv(operations: list[list[object]]) -> list[object]:
    history = {}
    table = {}
    results = []
    for op in operations:
        if op[0] == 'SET':
            _, key, value, ts = op
            stamps = history.setdefault(key, [])
            if ts not in stamps:
                stamps.append(ts); stamps.sort()
            table[(key, ts)] = value
        else:
            _, key, ts = op
            stamps = history.get(key, [])
            candidates = [stamp for stamp in stamps if stamp <= ts]
            results.append(None if not candidates else table[(key, candidates[-1])])
    return results

def lru_cache(capacity: int, operations: list[list[str]]) -> list[str]:
    cache = {}
    order = []
    out = []
    for op in operations:
        if op[0] == 'get':
            key = op[1]
            if key in cache:
                order.remove(key)
                order.append(key)
                out.append(cache[key])
            else:
                out.append('-1')
        else:
            key, value = op[1], op[2]
            if key in cache:
                order.remove(key)
            cache[key] = value
            order.append(key)
            if len(order) > capacity:
                oldest = order.pop(0)
                del cache[oldest]
    return out

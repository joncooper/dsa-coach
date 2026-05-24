def solution(queries):
    store = {}
    ttls = {}
    out = []

    def alive(key, field, ts):
        if key not in store or field not in store[key]:
            return False
        exp = ttls.get((key, field))
        return exp is None or ts < exp

    def render(pairs):
        pairs.sort(key=lambda kv: kv[0])
        return ",".join(f + "=" + v for f, v in pairs)

    for q in queries:
        ts = int(q[1])
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            ttls.pop((key, field), None)
            out.append("true")
        elif op == "SET_AT":
            key, field, value = q[2], q[3], q[4]
            ttl = int(q[5])
            store.setdefault(key, {})[field] = value
            ttls[(key, field)] = ts + ttl
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            out.append(store[key][field] if alive(key, field, ts) else "")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if not alive(key, field, ts):
                out.append("false")
            else:
                del store[key][field]
                if not store[key]:
                    del store[key]
                ttls.pop((key, field), None)
                out.append("true")
        elif op == "SCAN":
            key = q[2]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if alive(key, f, ts)]
                out.append(render(live) if live else "")
        elif op == "SCAN_BY_PREFIX":
            key, prefix = q[2], q[3]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if f.startswith(prefix) and alive(key, f, ts)]
                out.append(render(live) if live else "")
        else:
            out.append("")
    return out

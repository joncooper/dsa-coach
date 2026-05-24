def solution(queries):
    store = {}
    out = []

    def render(pairs):
        pairs.sort(key=lambda kv: kv[0])
        return ",".join(f + "=" + v for f, v in pairs)

    for q in queries:
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                out.append(store[key][field])
            else:
                out.append("")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                del store[key][field]
                if not store[key]:
                    del store[key]
                out.append("true")
            else:
                out.append("false")
        elif op == "SCAN":
            key = q[2]
            if key not in store or not store[key]:
                out.append("")
            else:
                out.append(render(list(store[key].items())))
        elif op == "SCAN_BY_PREFIX":
            key, prefix = q[2], q[3]
            if key not in store:
                out.append("")
            else:
                matched = [(f, v) for f, v in store[key].items() if f.startswith(prefix)]
                out.append(render(matched) if matched else "")
        else:
            out.append("")
    return out

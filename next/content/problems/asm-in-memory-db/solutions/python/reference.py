def solution(queries):
    store = {}
    out = []
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
        else:
            out.append("")
    return out

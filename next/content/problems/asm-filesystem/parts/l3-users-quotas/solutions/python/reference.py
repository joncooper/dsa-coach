SYS = "$system"

def solution(queries):
    files = {}
    users = {}
    out = []

    def render(matches):
        items = sorted(matches, key=lambda kv: (-kv[1], kv[0]))
        return ",".join(n + "(" + str(s) + ")" for n, s in items)

    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = {"size": size, "owner": SYS}
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]["size"]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                files[dst] = {"size": files[src]["size"], "owner": SYS}
                out.append("true")
        elif op == "FIND_BY_PREFIX":
            prefix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.startswith(prefix)]))
        elif op == "FIND_BY_SUFFIX":
            suffix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.endswith(suffix)]))
        elif op == "ADD_USER":
            user, limit = q[1], int(q[2])
            if user in users:
                out.append("false")
            else:
                users[user] = {"limit": limit, "used": 0}
                out.append("true")
        elif op == "ADD_FILE_BY":
            user, name, size = q[1], q[2], int(q[3])
            if user not in users or name in files or size > users[user]["limit"]:
                out.append("false")
                continue
            u = users[user]
            if u["used"] + size > u["limit"]:
                owned = sorted(
                    [(n, fo["size"]) for n, fo in files.items() if fo["owner"] == user],
                    key=lambda kv: (-kv[1], kv[0]),
                )
                i = 0
                while u["used"] + size > u["limit"] and i < len(owned):
                    victim = owned[i][0]
                    u["used"] -= files[victim]["size"]
                    del files[victim]
                    i += 1
            files[name] = {"size": size, "owner": user}
            u["used"] += size
            out.append("true")
        else:
            out.append("")
    return out

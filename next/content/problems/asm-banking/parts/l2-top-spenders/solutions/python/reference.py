def solution(queries):
    balances = {}
    spent = {}
    out = []

    def render_top(n):
        if n <= 0 or not balances:
            return ""
        rows = [(name, spent.get(name, 0)) for name in balances]
        rows.sort(key=lambda r: (-r[1], r[0]))
        rows = rows[:n]
        return ",".join(name + "(" + str(total) + ")" for name, total in rows)

    for q in queries:
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                spent[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                spent[account] = spent.get(account, 0) + amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                spent[src] = spent.get(src, 0) + amount
                out.append(str(balances[src]))
        elif op == "TOP_SPENDERS":
            n = int(q[2])
            out.append(render_top(n))
        else:
            out.append("")
    return out

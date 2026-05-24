def solution(queries):
    balances = {}
    spent = {}
    payments = {}     # id -> {"account","amount","exec_at","seq","status"}
    schedule_seq = 0
    out = []

    def render_top(n):
        if n <= 0 or not balances:
            return ""
        rows = [(name, spent.get(name, 0)) for name in balances]
        rows.sort(key=lambda r: (-r[1], r[0]))
        rows = rows[:n]
        return ",".join(name + "(" + str(total) + ")" for name, total in rows)

    def fire_due(ts):
        due = [pid for pid, p in payments.items() if p["status"] == "pending" and p["exec_at"] <= ts]
        due.sort(key=lambda pid: (payments[pid]["exec_at"], payments[pid]["seq"]))
        for pid in due:
            p = payments[pid]
            account = p["account"]
            amount = p["amount"]
            if account not in balances or balances[account] < amount:
                p["status"] = "cancelled"
                continue
            balances[account] -= amount
            spent[account] = spent.get(account, 0) + amount
            p["status"] = "fired"

    for q in queries:
        ts = int(q[1])
        fire_due(ts)
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
            out.append(render_top(int(q[2])))
        elif op == "SCHEDULE_PAYMENT":
            account = q[2]
            amount = int(q[3])
            delay = int(q[4])
            if account not in balances:
                out.append("")
            else:
                schedule_seq += 1
                pid = "payment" + str(schedule_seq)
                payments[pid] = {
                    "account": account,
                    "amount": amount,
                    "exec_at": ts + delay,
                    "seq": schedule_seq,
                    "status": "pending",
                }
                out.append(pid)
        elif op == "CANCEL_PAYMENT":
            account = q[2]
            pid = q[3]
            p = payments.get(pid)
            if not p or p["status"] != "pending" or p["account"] != account:
                out.append("false")
            else:
                p["status"] = "cancelled"
                out.append("true")
        else:
            out.append("")
    return out

def solution(queries):
    workers = {}
    double_pay = []
    out = []

    def covered_double_time(start, end):
        clipped = []
        for period_start, period_end in double_pay:
            left = max(start, period_start)
            right = min(end, period_end)
            if left < right:
                clipped.append((left, right))
        if not clipped:
            return 0
        clipped.sort()
        total = 0
        current_start, current_end = clipped[0]
        for left, right in clipped[1:]:
            if left <= current_end:
                current_end = max(current_end, right)
            else:
                total += current_end - current_start
                current_start, current_end = left, right
        total += current_end - current_start
        return total

    def add_session(worker, start, end):
        if end <= start:
            return
        duration = end - start
        position = worker["active_position"]
        compensation = worker["active_compensation"]
        worker["total_time"] += duration
        worker["time_by_position"][position] = worker["time_by_position"].get(position, 0) + duration
        worker["sessions"].append((start, end, position, compensation))

    def apply_pending_on_entry(worker, timestamp):
        pending = worker["pending"]
        if pending and timestamp >= pending["start"]:
            worker["position"] = pending["position"]
            worker["compensation"] = pending["compensation"]
            worker["pending"] = None

    def calc_salary(worker, start, end):
        total = 0
        for session_start, session_end, _position, compensation in worker["sessions"]:
            left = max(start, session_start)
            right = min(end, session_end)
            if left >= right:
                continue
            duration = right - left
            total += duration * compensation
            total += covered_double_time(left, right) * compensation
        return total

    def top_workers(count, position):
        if count <= 0:
            return ""
        rows = []
        for worker_id, worker in workers.items():
            if worker["position"] == position:
                rows.append((worker_id, worker["time_by_position"].get(position, 0)))
        rows.sort(key=lambda row: (-row[1], row[0]))
        return ",".join(worker_id + "(" + str(time) + ")" for worker_id, time in rows[:count])

    for query in queries:
        op = query[0]
        if op == "ADD_WORKER":
            worker_id, position, compensation = query[1], query[2], int(query[3])
            if worker_id in workers:
                out.append("false")
            else:
                workers[worker_id] = {
                    "position": position,
                    "compensation": compensation,
                    "inside_since": None,
                    "active_position": position,
                    "active_compensation": compensation,
                    "total_time": 0,
                    "time_by_position": {},
                    "sessions": [],
                    "pending": None,
                }
                out.append("true")
        elif op == "REGISTER":
            worker_id, timestamp = query[1], int(query[2])
            worker = workers.get(worker_id)
            if not worker:
                out.append("invalid_request")
            elif worker["inside_since"] is None:
                apply_pending_on_entry(worker, timestamp)
                worker["inside_since"] = timestamp
                worker["active_position"] = worker["position"]
                worker["active_compensation"] = worker["compensation"]
                out.append("registered")
            else:
                add_session(worker, worker["inside_since"], timestamp)
                worker["inside_since"] = None
                out.append("registered")
        elif op == "GET":
            worker = workers.get(query[1])
            out.append("" if not worker else str(worker["total_time"]))
        elif op == "TOP_N_WORKERS":
            out.append(top_workers(int(query[1]), query[2]))
        elif op == "PROMOTE":
            worker_id, position = query[1], query[2]
            compensation, start = int(query[3]), int(query[4])
            worker = workers.get(worker_id)
            if not worker or worker["pending"] is not None:
                out.append("invalid_request")
            else:
                worker["pending"] = {
                    "position": position,
                    "compensation": compensation,
                    "start": start,
                }
                out.append("success")
        elif op == "CALC_SALARY":
            worker = workers.get(query[1])
            if not worker:
                out.append("")
            else:
                out.append(str(calc_salary(worker, int(query[2]), int(query[3]))))
        elif op == "SET_DOUBLE_PAY":
            start, end = int(query[1]), int(query[2])
            if start >= end:
                out.append("false")
            else:
                double_pay.append((start, end))
                out.append("true")
        else:
            out.append("")

    return out

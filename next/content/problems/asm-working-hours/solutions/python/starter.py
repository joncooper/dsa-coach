def solution(queries):
    workers = {}
    result = []

    for query in queries:
        op = query[0]
        if op == "ADD_WORKER":
            # Add worker state here.
            result.append("")
        elif op == "REGISTER":
            # Toggle whether the worker is currently inside the office.
            result.append("")
        elif op == "GET":
            # Return completed working time.
            result.append("")
        elif op == "TOP_N_WORKERS":
            result.append("")
        elif op == "PROMOTE":
            result.append("")
        elif op == "CALC_SALARY":
            result.append("")
        elif op == "SET_DOUBLE_PAY":
            result.append("")
        else:
            result.append("")

    return result

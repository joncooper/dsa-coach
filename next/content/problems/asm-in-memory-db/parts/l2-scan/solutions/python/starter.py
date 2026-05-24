def solution(queries):
    store = {}
    results = []
    for query in queries:
        op = query[0]
        # Level 1 ops, plus:
        # SCAN           ts key        -> "f1=v1,f2=v2" / ""
        # SCAN_BY_PREFIX ts key prefix -> "f1=v1,f2=v2" / ""
        results.append("")
    return results

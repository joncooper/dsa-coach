def solution(queries):
    files = {}            # name -> {"size": int, "owner": str}
    users = {}            # user -> {"limit": int, "used": int}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops, plus:
        # ADD_USER user capacity      -> "true" / "false"
        # ADD_FILE_BY user name size  -> "true" / "false" (largest-first eviction)
        results.append("")
    return results

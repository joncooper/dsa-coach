def solution(queries):
    store = {}
    ttls = {}             # (key, field) -> absolute expiration timestamp
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops (now expiration-aware), plus:
        # SET_AT ts key field value ttl -> "true"
        results.append("")
    return results

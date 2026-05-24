def solution(queries):
    files = {}            # name -> size
    results = []
    for query in queries:
        op = query[0]
        # Level 1 ops, plus:
        # FIND_BY_PREFIX prefix  -> "n1(s1),n2(s2)" / ""
        # FIND_BY_SUFFIX suffix  -> "n1(s1),n2(s2)" / ""
        results.append("")
    return results

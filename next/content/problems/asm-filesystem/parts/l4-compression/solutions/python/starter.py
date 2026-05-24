def solution(queries):
    files = {}            # name -> {"size","owner","compressed","orig"}
    users = {}            # user -> {"limit","used"}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-3 ops, plus:
        # COMPRESS_FILE user name    -> "<new size>" / ""
        # DECOMPRESS_FILE user name  -> "<restored size>" / ""
        results.append("")
    return results

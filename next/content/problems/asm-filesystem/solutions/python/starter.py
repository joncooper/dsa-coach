def solution(queries):
    files = {}            # name -> size
    results = []
    for query in queries:
        op = query[0]
        # ADD_FILE name size   -> "true" / "false"
        # GET_FILE_SIZE name   -> "<size>" / ""
        # COPY_FILE src dst    -> "true" / "false"
        results.append("")
    return results

def solution(queries):
    store = {}            # key -> {field: value}
    results = []
    for query in queries:
        op = query[0]
        # SET    ts key field value -> "true"
        # GET    ts key field       -> "<value>" / ""
        # DELETE ts key field       -> "true" / "false"
        results.append("")
    return results

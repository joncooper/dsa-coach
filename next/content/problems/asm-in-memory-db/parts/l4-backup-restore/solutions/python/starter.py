def solution(queries):
    store = {}
    ttls = {}
    backups = {}          # backup_id -> snapshot
    results = []
    for query in queries:
        op = query[0]
        # Level 1-3 ops, plus:
        # BACKUP  ts            -> "backup{N}"
        # RESTORE ts backup_id  -> "true" / "false"
        results.append("")
    return results

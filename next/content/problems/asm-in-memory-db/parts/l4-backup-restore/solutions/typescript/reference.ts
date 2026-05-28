type Backup = { store: Map<string, Map<string, string>>; ttls: Map<string, Map<string, number>> };

export function solution(queries: string[][]): string[] {
  let store = new Map<string, Map<string, string>>();
  let ttls = new Map<string, Map<string, number>>();
  const backups = new Map<string, Backup>();
  const out: string[] = [];
  let backupSeq = 0;

  const render = (rows: Array<[string, string]>): string =>
    rows.sort((a, b) => a[0].localeCompare(b[0])).map(([field, value]) => field + "=" + value).join(",");

  const ensureFields = (key: string): Map<string, string> => {
    if (!store.has(key)) store.set(key, new Map());
    return store.get(key)!;
  };

  const setExpiration = (key: string, field: string, expiresAt: number): void => {
    if (!ttls.has(key)) ttls.set(key, new Map());
    ttls.get(key)!.set(field, expiresAt);
  };

  const clearExpiration = (key: string, field: string): void => {
    const fields = ttls.get(key);
    if (!fields) return;
    fields.delete(field);
    if (fields.size === 0) ttls.delete(key);
  };

  const expiration = (key: string, field: string): number | undefined => ttls.get(key)?.get(field);
  const alive = (key: string, field: string, timestamp: number): boolean => {
    if (!store.get(key)?.has(field)) return false;
    const expiresAt = expiration(key, field);
    return expiresAt === undefined || timestamp < expiresAt;
  };

  const deleteField = (key: string, field: string): void => {
    const fields = store.get(key);
    fields?.delete(field);
    if (fields?.size === 0) store.delete(key);
    clearExpiration(key, field);
  };

  const liveRows = (key: string, timestamp: number, prefix = ""): Array<[string, string]> => {
    const fields = store.get(key);
    if (!fields) return [];
    return [...fields].filter(([field]) => field.startsWith(prefix) && alive(key, field, timestamp));
  };

  const cloneStore = (source: Map<string, Map<string, string>>): Map<string, Map<string, string>> =>
    new Map([...source].map(([key, fields]) => [key, new Map(fields)]));

  const cloneTtls = (source: Map<string, Map<string, number>>): Map<string, Map<string, number>> =>
    new Map([...source].map(([key, fields]) => [key, new Map(fields)]));

  for (const query of queries) {
    const timestamp = Number(query[1]);
    switch (query[0]) {
      case "SET": {
        const [key, field, value] = [query[2], query[3], query[4]];
        ensureFields(key).set(field, value);
        clearExpiration(key, field);
        out.push("true");
        break;
      }
      case "SET_AT": {
        const [key, field, value] = [query[2], query[3], query[4]];
        ensureFields(key).set(field, value);
        setExpiration(key, field, timestamp + Number(query[5]));
        out.push("true");
        break;
      }
      case "GET":
        out.push(alive(query[2], query[3], timestamp) ? store.get(query[2])!.get(query[3])! : "");
        break;
      case "DELETE":
        if (alive(query[2], query[3], timestamp)) {
          deleteField(query[2], query[3]);
          out.push("true");
        } else out.push("false");
        break;
      case "SCAN":
        out.push(render(liveRows(query[2], timestamp)));
        break;
      case "SCAN_BY_PREFIX":
        out.push(render(liveRows(query[2], timestamp, query[3])));
        break;
      case "BACKUP": {
        backupSeq += 1;
        const snapStore = new Map<string, Map<string, string>>();
        const snapTtls = new Map<string, Map<string, number>>();
        for (const [key, fields] of store) {
          const live = new Map<string, string>();
          for (const [field, value] of fields) {
            if (!alive(key, field, timestamp)) continue;
            live.set(field, value);
            const expiresAt = expiration(key, field);
            if (expiresAt !== undefined) {
              if (!snapTtls.has(key)) snapTtls.set(key, new Map());
              snapTtls.get(key)!.set(field, expiresAt);
            }
          }
          if (live.size > 0) snapStore.set(key, live);
        }
        const id = "backup" + backupSeq;
        backups.set(id, { store: snapStore, ttls: snapTtls });
        out.push(id);
        break;
      }
      case "RESTORE": {
        const backup = backups.get(query[2]);
        if (!backup) {
          out.push("false");
          break;
        }
        store = cloneStore(backup.store);
        ttls = cloneTtls(backup.ttls);
        for (const [key, fields] of [...ttls]) {
          for (const [field, expiresAt] of [...fields]) {
            if (expiresAt <= timestamp) deleteField(key, field);
          }
        }
        out.push("true");
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

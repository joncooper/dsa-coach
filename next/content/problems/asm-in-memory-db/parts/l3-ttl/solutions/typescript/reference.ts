export function solution(queries: string[][]): string[] {
  const store = new Map<string, Map<string, string>>();
  const ttls = new Map<string, Map<string, number>>();
  const out: string[] = [];

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
      default:
        out.push("");
    }
  }

  return out;
}

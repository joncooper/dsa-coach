export function solution(queries: string[][]): string[] {
  const store = new Map<string, Map<string, string>>();
  const out: string[] = [];

  const render = (rows: Array<[string, string]>): string =>
    rows.sort((a, b) => a[0].localeCompare(b[0])).map(([field, value]) => field + "=" + value).join(",");

  const deleteField = (key: string, field: string): boolean => {
    const fields = store.get(key);
    if (!fields || !fields.has(field)) return false;
    fields.delete(field);
    if (fields.size === 0) store.delete(key);
    return true;
  };

  for (const query of queries) {
    switch (query[0]) {
      case "SET": {
        const [key, field, value] = [query[2], query[3], query[4]];
        if (!store.has(key)) store.set(key, new Map());
        store.get(key)!.set(field, value);
        out.push("true");
        break;
      }
      case "GET":
        out.push(store.get(query[2])?.get(query[3]) ?? "");
        break;
      case "DELETE":
        out.push(deleteField(query[2], query[3]) ? "true" : "false");
        break;
      case "SCAN":
        out.push(render([...(store.get(query[2]) ?? new Map())]));
        break;
      case "SCAN_BY_PREFIX": {
        const fields = store.get(query[2]);
        out.push(fields ? render([...fields].filter(([field]) => field.startsWith(query[3]))) : "");
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

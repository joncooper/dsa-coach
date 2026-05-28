export function solution(queries: string[][]): string[] {
  const files = new Map<string, number>();
  const out: string[] = [];

  const render = (rows: Array<[string, number]>): string =>
    rows
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, size]) => name + "(" + size + ")")
      .join(",");

  for (const query of queries) {
    switch (query[0]) {
      case "ADD_FILE": {
        const name = query[1];
        const size = Number(query[2]);
        if (files.has(name)) out.push("false");
        else {
          files.set(name, size);
          out.push("true");
        }
        break;
      }
      case "GET_FILE_SIZE": {
        const size = files.get(query[1]);
        out.push(size === undefined ? "" : String(size));
        break;
      }
      case "COPY_FILE": {
        const size = files.get(query[1]);
        if (size === undefined) out.push("false");
        else {
          files.set(query[2], size);
          out.push("true");
        }
        break;
      }
      case "FIND_BY_PREFIX":
        out.push(render([...files].filter(([name]) => name.startsWith(query[1]))));
        break;
      case "FIND_BY_SUFFIX":
        out.push(render([...files].filter(([name]) => name.endsWith(query[1]))));
        break;
      default:
        out.push("");
    }
  }

  return out;
}

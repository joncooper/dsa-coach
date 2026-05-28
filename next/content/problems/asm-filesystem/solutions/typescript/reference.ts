export function solution(queries: string[][]): string[] {
  const files = new Map<string, number>();
  const out: string[] = [];

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
      default:
        out.push("");
    }
  }

  return out;
}

type FileInfo = { size: number; owner: string };
type UserInfo = { limit: number; used: number };

const SYSTEM = "$system";

export function solution(queries: string[][]): string[] {
  const files = new Map<string, FileInfo>();
  const users = new Map<string, UserInfo>();
  const out: string[] = [];

  const render = (rows: Array<[string, number]>): string =>
    rows
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, size]) => name + "(" + size + ")")
      .join(",");

  const evictFor = (user: string, size: number): void => {
    const info = users.get(user)!;
    const owned = [...files]
      .filter(([, file]) => file.owner === user)
      .map(([name, file]) => [name, file.size] as [string, number])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    for (const [name, fileSize] of owned) {
      if (info.used + size <= info.limit) break;
      files.delete(name);
      info.used -= fileSize;
    }
  };

  const sizedRows = (predicate: (name: string) => boolean): Array<[string, number]> =>
    [...files]
      .filter(([name]) => predicate(name))
      .map(([name, file]) => [name, file.size] as [string, number]);

  for (const query of queries) {
    switch (query[0]) {
      case "ADD_FILE": {
        const name = query[1];
        const size = Number(query[2]);
        if (files.has(name)) out.push("false");
        else {
          files.set(name, { size, owner: SYSTEM });
          out.push("true");
        }
        break;
      }
      case "GET_FILE_SIZE": {
        const file = files.get(query[1]);
        out.push(file ? String(file.size) : "");
        break;
      }
      case "COPY_FILE": {
        const source = files.get(query[1]);
        if (!source) out.push("false");
        else {
          files.set(query[2], { size: source.size, owner: SYSTEM });
          out.push("true");
        }
        break;
      }
      case "FIND_BY_PREFIX":
        out.push(render(sizedRows((name) => name.startsWith(query[1]))));
        break;
      case "FIND_BY_SUFFIX":
        out.push(render(sizedRows((name) => name.endsWith(query[1]))));
        break;
      case "ADD_USER": {
        const user = query[1];
        if (users.has(user)) out.push("false");
        else {
          users.set(user, { limit: Number(query[2]), used: 0 });
          out.push("true");
        }
        break;
      }
      case "ADD_FILE_BY": {
        const [user, name] = [query[1], query[2]];
        const size = Number(query[3]);
        const info = users.get(user);
        if (!info || files.has(name) || size > info.limit) {
          out.push("false");
          break;
        }
        if (info.used + size > info.limit) evictFor(user, size);
        files.set(name, { size, owner: user });
        info.used += size;
        out.push("true");
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

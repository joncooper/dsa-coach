export function runFs(commands: unknown[][]): unknown[] {
  type Node = { type: "dir"; children: Record<string, Node> } | { type: "file"; content: string };
  const root: Node = { type: "dir", children: {} };
  const parts = (path: string) => path.split("/").filter(Boolean);
  const nodeAt = (segs: string[], create = false): Node | undefined => {
    let node: Node = root;
    for (const seg of segs) {
      if (node.type !== "dir") return undefined;
      if (!node.children[seg]) { if (!create) return undefined; node.children[seg] = { type: "dir", children: {} }; }
      node = node.children[seg];
    }
    return node;
  };
  const out: unknown[] = [];
  for (const cmd of commands) {
    const op = cmd[0];
    if (op === "mkdir") nodeAt(parts(String(cmd[1])), true);
    else if (op === "addFile") { const segs = parts(String(cmd[1])); const parent = nodeAt(segs.slice(0, -1), true) as Extract<Node, { type: "dir" }>; parent.children[segs.at(-1)!] = { type: "file", content: String(cmd[2]) }; }
    else if (op === "ls") { const segs = parts(String(cmd[1])); const node = nodeAt(segs)!; out.push(node.type === "file" ? [segs.at(-1)!] : Object.keys(node.children).sort()); }
    else if (op === "cat") out.push((nodeAt(parts(String(cmd[1]))) as Extract<Node, { type: "file" }>).content);
    else if (op === "rm") { const segs = parts(String(cmd[1])); const parent = nodeAt(segs.slice(0, -1)) as Extract<Node, { type: "dir" }> | undefined; if (parent && segs.length) delete parent.children[segs.at(-1)!]; }
  }
  return out;
}

export function isomorphicStrings(source: string, target: string): boolean {
  if (source.length !== target.length) return false;
  const forward = new Map<string, string>();
  const used = new Set<string>();
  for (let index = 0; index < source.length; index += 1) {
    const left = source[index];
    const right = target[index];
    if (forward.has(left)) {
      if (forward.get(left) !== right) return false;
    } else {
      if (used.has(right)) return false;
      forward.set(left, right);
      used.add(right);
    }
  }
  return true;
}

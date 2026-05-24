export function restoreIpAddresses(digits: string): string[] {
  if (!/^\d+$/.test(digits)) return [];
  const result: string[] = [];
  const parts: string[] = [];
  const valid = (segment: string) => {
    if (segment.length > 1 && segment[0] === "0") return false;
    const value = Number(segment);
    return value >= 0 && value <= 255;
  };
  const backtrack = (start: number) => {
    if (parts.length === 4) {
      if (start === digits.length) result.push(parts.join("."));
      return;
    }
    for (let length = 1; length <= 3; length += 1) {
      if (start + length > digits.length) break;
      const segment = digits.slice(start, start + length);
      if (valid(segment)) {
        parts.push(segment);
        backtrack(start + length);
        parts.pop();
      }
    }
  };
  backtrack(0);
  return result.sort();
}

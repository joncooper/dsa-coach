export function mergeTimeBlocks(blocks: number[][]): number[][] {
  const ordered = blocks
    .map(([start, end]) => [start, end])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: number[][] = [];

  for (const [start, end] of ordered) {
    const last = merged[merged.length - 1];
    if (!last || start > last[1]) {
      merged.push([start, end]);
    } else {
      last[1] = Math.max(last[1], end);
    }
  }

  return merged;
}

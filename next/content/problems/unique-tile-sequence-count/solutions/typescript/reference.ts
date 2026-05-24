export function uniqueTileSequenceCount(tiles: string): number {
  const counts = new Map<string, number>();
  for (const tile of tiles) counts.set(tile, (counts.get(tile) ?? 0) + 1);
  const letters = [...counts.keys()].sort();
  const dfs = (): number => {
    let total = 0;
    for (const letter of letters) {
      const count = counts.get(letter) ?? 0;
      if (count === 0) continue;
      counts.set(letter, count - 1);
      total += 1 + dfs();
      counts.set(letter, count);
    }
    return total;
  };
  return dfs();
}

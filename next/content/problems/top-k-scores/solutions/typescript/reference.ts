export function topKScores(scores: number[], k: number): number[] {
  if (k <= 0) return [];
  return [...scores].sort((a, b) => b - a).slice(0, k);
}

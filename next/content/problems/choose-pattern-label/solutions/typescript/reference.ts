export function choosePatternLabel(features: string[]): string {
  const text = features.map((feature) => feature.toLowerCase()).join(" ");
  const groups: Array<[string, string[]]> = [
    ["graph", ["node", "edge", "shortest", "connected"]],
    ["dp", ["subproblem", "reuse", "minimum", "optimal"]],
    ["binary-search", ["sorted", "boundary", "answer"]],
    ["sliding-window", ["contiguous", "window", "at most", "positive"]]
  ];
  for (const [label, needles] of groups) {
    if (needles.some((needle) => text.includes(needle))) return label;
  }
  return "hashing";
}

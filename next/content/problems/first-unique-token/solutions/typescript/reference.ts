export function firstUniqueToken(tokens: string[]): string {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  for (const token of tokens) {
    if (counts.get(token) === 1) return token;
  }
  return "";
}

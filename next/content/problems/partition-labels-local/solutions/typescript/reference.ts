export function partitionLabelsLocal(text: string): number[] {
  const last = new Map<string, number>();
  for (let index = 0; index < text.length; index += 1) last.set(text[index], index);
  const parts: number[] = [];
  let start = 0;
  let end = 0;
  for (let index = 0; index < text.length; index += 1) {
    end = Math.max(end, last.get(text[index])!);
    if (index === end) {
      parts.push(end - start + 1);
      start = index + 1;
    }
  }
  return parts;
}

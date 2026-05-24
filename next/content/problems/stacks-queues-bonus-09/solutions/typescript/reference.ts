export function decodeString(text: string): string {
  const counts: number[] = [];
  const pieces: string[] = [];
  let current = "";
  let count = 0;
  for (const char of text) {
    if (/\d/.test(char)) count = count * 10 + Number(char);
    else if (char === "[") {
      counts.push(count);
      pieces.push(current);
      current = "";
      count = 0;
    } else if (char === "]") {
      const repeat = counts.pop()!;
      current = pieces.pop()! + current.repeat(repeat);
    } else {
      current += char;
    }
  }
  return current;
}

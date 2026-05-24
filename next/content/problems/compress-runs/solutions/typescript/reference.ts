export function compressRuns(text: string): string {
  if (text.length === 0) return "";
  const pieces: string[] = [];
  let active = text[0];
  let count = 1;
  for (let index = 1; index < text.length; index += 1) {
    const char = text[index];
    if (char === active) {
      count += 1;
    } else {
      pieces.push(`${active}${count}`);
      active = char;
      count = 1;
    }
  }
  pieces.push(`${active}${count}`);
  return pieces.join("");
}

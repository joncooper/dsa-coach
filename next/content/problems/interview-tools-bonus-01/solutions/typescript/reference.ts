export function reverseVowels(text: string): string {
  const vowels = new Set("aeiouAEIOU".split(""));
  const chars = [...text];
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    if (!vowels.has(chars[left])) left += 1;
    else if (!vowels.has(chars[right])) right -= 1;
    else {
      [chars[left], chars[right]] = [chars[right], chars[left]];
      left += 1;
      right -= 1;
    }
  }
  return chars.join("");
}

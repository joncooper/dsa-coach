export function isLoosePalindrome(text: string): boolean {
  let left = 0;
  let right = text.length - 1;
  const isAlnum = (char: string) => /[a-z0-9]/i.test(char);
  while (left < right) {
    while (left < right && !isAlnum(text[left])) left += 1;
    while (left < right && !isAlnum(text[right])) right -= 1;
    if (text[left].toLowerCase() !== text[right].toLowerCase()) return false;
    left += 1;
    right -= 1;
  }
  return true;
}

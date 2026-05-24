export function distinctPermutations(nums: number[]): number[][] {
  const ordered = [...nums].sort((a, b) => a - b);
  const result: number[][] = [];
  const used = new Array<boolean>(ordered.length).fill(false);
  const current: number[] = [];
  const backtrack = () => {
    if (current.length === ordered.length) { result.push([...current]); return; }
    for (let index = 0; index < ordered.length; index += 1) {
      if (used[index]) continue;
      if (index > 0 && ordered[index] === ordered[index - 1] && !used[index - 1]) continue;
      used[index] = true;
      current.push(ordered[index]);
      backtrack();
      current.pop();
      used[index] = false;
    }
  };
  backtrack();
  return result;
}

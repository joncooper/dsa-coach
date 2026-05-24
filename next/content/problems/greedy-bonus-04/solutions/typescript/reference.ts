export function canPlantFlowers(bed: number[], k: number): boolean {
  const plots = [...bed];
  let planted = 0;
  for (let index = 0; index < plots.length; index += 1) {
    const leftEmpty = index === 0 || plots[index - 1] === 0;
    const rightEmpty = index === plots.length - 1 || plots[index + 1] === 0;
    if (plots[index] === 0 && leftEmpty && rightEmpty) {
      plots[index] = 1;
      planted += 1;
      if (planted >= k) return true;
    }
  }
  return planted >= k;
}

export function oddEvenList(values: number[]): number[] {
  const odds: number[] = [];
  const evens: number[] = [];
  for (let index = 0; index < values.length; index += 1) {
    if (index % 2 === 0) odds.push(values[index]);
    else evens.push(values[index]);
  }
  return odds.concat(evens);
}

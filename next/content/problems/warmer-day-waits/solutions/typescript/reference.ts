export function warmerDayWaits(temperatures: number[]): number[] {
  const waits = new Array<number>(temperatures.length).fill(0);
  const stack: number[] = [];
  for (let day = 0; day < temperatures.length; day += 1) {
    while (stack.length > 0 && temperatures[day] > temperatures[stack[stack.length - 1]]) {
      const previous = stack.pop()!;
      waits[previous] = day - previous;
    }
    stack.push(day);
  }
  return waits;
}

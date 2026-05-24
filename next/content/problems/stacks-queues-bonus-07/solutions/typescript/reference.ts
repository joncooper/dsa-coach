export function hotPotato(players: unknown[], passes: number): unknown {
  const queue = [...players];
  while (queue.length > 1) {
    for (let count = 0; count < passes; count += 1) queue.push(queue.shift());
    queue.shift();
  }
  return queue[0];
}

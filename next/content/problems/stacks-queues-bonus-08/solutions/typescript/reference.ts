export function asteroidCollision(asteroids: number[]): number[] {
  const stack: number[] = [];
  for (const asteroid of asteroids) {
    let active = asteroid;
    let alive = true;
    while (alive && active < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -active) stack.pop();
      else if (top === -active) {
        stack.pop();
        alive = false;
      } else {
        alive = false;
      }
    }
    if (alive) stack.push(active);
  }
  return stack;
}

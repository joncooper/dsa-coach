export function recentActiveUsers(timestamps: number[], users: string[], window: number): number[] {
  let left = 0;
  const countsByUser = new Map<string, number>();
  const results: number[] = [];

  for (let right = 0; right < timestamps.length; right += 1) {
    const timestamp = timestamps[right];
    const user = users[right];
    countsByUser.set(user, (countsByUser.get(user) ?? 0) + 1);

    while (timestamps[left] < timestamp - window) {
      const oldUser = users[left];
      const nextCount = (countsByUser.get(oldUser) ?? 0) - 1;
      if (nextCount === 0) {
        countsByUser.delete(oldUser);
      } else {
        countsByUser.set(oldUser, nextCount);
      }
      left += 1;
    }

    results.push(countsByUser.size);
  }

  return results;
}

export function applyTransactions(startingBalances: Record<string, number>, transactions: Array<Record<string, unknown>>): [Record<string, number>, number[]] {
  const balances: Record<string, number> = { ...startingBalances };
  const rejected: number[] = [];
  for (let index = 0; index < transactions.length; index += 1) {
    const txn = transactions[index];
    const kind = txn.type;
    const amount = Number(txn.amount ?? 0);
    if (kind === "DEPOSIT") {
      const account = String(txn.account);
      if (Object.hasOwn(balances, account)) balances[account] += amount;
      else rejected.push(index);
    } else if (kind === "WITHDRAW") {
      const account = String(txn.account);
      if (Object.hasOwn(balances, account) && balances[account] >= amount) balances[account] -= amount;
      else rejected.push(index);
    } else if (kind === "TRANSFER") {
      const src = String(txn.from);
      const dst = String(txn.to);
      if (Object.hasOwn(balances, src) && Object.hasOwn(balances, dst) && balances[src] >= amount) {
        balances[src] -= amount;
        balances[dst] += amount;
      } else rejected.push(index);
    } else rejected.push(index);
  }
  return [balances, rejected];
}

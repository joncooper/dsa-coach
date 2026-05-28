export function solution(queries: string[][]): string[] {
  const balances = new Map<string, number>();
  const out: string[] = [];

  for (const query of queries) {
    switch (query[0]) {
      case "CREATE_ACCOUNT": {
        const account = query[2];
        if (balances.has(account)) out.push("false");
        else {
          balances.set(account, 0);
          out.push("true");
        }
        break;
      }
      case "DEPOSIT": {
        const account = query[2];
        const amount = Number(query[3]);
        const balance = balances.get(account);
        if (balance === undefined) out.push("");
        else {
          const next = balance + amount;
          balances.set(account, next);
          out.push(String(next));
        }
        break;
      }
      case "WITHDRAW": {
        const account = query[2];
        const amount = Number(query[3]);
        const balance = balances.get(account);
        if (balance === undefined || balance < amount) out.push("");
        else {
          const next = balance - amount;
          balances.set(account, next);
          out.push(String(next));
        }
        break;
      }
      case "TRANSFER": {
        const [source, target] = [query[2], query[3]];
        const amount = Number(query[4]);
        const sourceBalance = balances.get(source);
        const targetBalance = balances.get(target);
        if (source === target || sourceBalance === undefined || targetBalance === undefined || sourceBalance < amount) out.push("");
        else {
          balances.set(source, sourceBalance - amount);
          balances.set(target, targetBalance + amount);
          out.push(String(sourceBalance - amount));
        }
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

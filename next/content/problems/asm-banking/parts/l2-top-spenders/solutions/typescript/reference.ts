export function solution(queries: string[][]): string[] {
  const balances = new Map<string, number>();
  const spent = new Map<string, number>();
  const out: string[] = [];

  const renderTop = (count: number): string => {
    if (count <= 0 || balances.size === 0) return "";
    return [...balances.keys()]
      .map((name) => [name, spent.get(name) ?? 0] as [string, number])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, count)
      .map(([name, total]) => name + "(" + total + ")")
      .join(",");
  };

  const spend = (account: string, amount: number): void => spent.set(account, (spent.get(account) ?? 0) + amount);

  for (const query of queries) {
    switch (query[0]) {
      case "CREATE_ACCOUNT": {
        const account = query[2];
        if (balances.has(account)) out.push("false");
        else {
          balances.set(account, 0);
          spent.set(account, 0);
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
          balances.set(account, balance - amount);
          spend(account, amount);
          out.push(String(balance - amount));
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
          spend(source, amount);
          out.push(String(sourceBalance - amount));
        }
        break;
      }
      case "TOP_SPENDERS":
        out.push(renderTop(Number(query[2])));
        break;
      default:
        out.push("");
    }
  }

  return out;
}

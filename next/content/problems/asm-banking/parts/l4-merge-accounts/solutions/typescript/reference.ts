type Payment = { account: string; amount: number; execAt: number; seq: number; status: "pending" | "fired" | "cancelled" };

export function solution(queries: string[][]): string[] {
  const balances = new Map<string, number>();
  const spent = new Map<string, number>();
  const payments = new Map<string, Payment>();
  const out: string[] = [];
  let scheduleSeq = 0;

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

  const fireDue = (timestamp: number): void => {
    const due = [...payments]
      .filter(([, payment]) => payment.status === "pending" && payment.execAt <= timestamp)
      .sort((a, b) => a[1].execAt - b[1].execAt || a[1].seq - b[1].seq);

    for (const [, payment] of due) {
      const balance = balances.get(payment.account);
      if (balance === undefined || balance < payment.amount) {
        payment.status = "cancelled";
      } else {
        balances.set(payment.account, balance - payment.amount);
        spend(payment.account, payment.amount);
        payment.status = "fired";
      }
    }
  };

  for (const query of queries) {
    const timestamp = Number(query[1]);
    fireDue(timestamp);

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
      case "SCHEDULE_PAYMENT": {
        const account = query[2];
        if (!balances.has(account)) {
          out.push("");
          break;
        }
        scheduleSeq += 1;
        const id = "payment" + scheduleSeq;
        payments.set(id, { account, amount: Number(query[3]), execAt: timestamp + Number(query[4]), seq: scheduleSeq, status: "pending" });
        out.push(id);
        break;
      }
      case "CANCEL_PAYMENT": {
        const payment = payments.get(query[3]);
        if (!payment || payment.status !== "pending" || payment.account !== query[2]) out.push("false");
        else {
          payment.status = "cancelled";
          out.push("true");
        }
        break;
      }
      case "MERGE_ACCOUNTS": {
        const [primary, secondary] = [query[2], query[3]];
        const primaryBalance = balances.get(primary);
        const secondaryBalance = balances.get(secondary);
        if (primary === secondary || primaryBalance === undefined || secondaryBalance === undefined) {
          out.push("");
          break;
        }
        balances.set(primary, primaryBalance + secondaryBalance);
        spent.set(primary, (spent.get(primary) ?? 0) + (spent.get(secondary) ?? 0));
        for (const payment of payments.values()) {
          if (payment.status === "pending" && payment.account === secondary) payment.account = primary;
        }
        balances.delete(secondary);
        spent.delete(secondary);
        out.push(String(balances.get(primary)));
        break;
      }
      default:
        out.push("");
    }
  }

  return out;
}

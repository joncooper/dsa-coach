export function realizedPnl(trades: Array<{ side: string; qty: number; price: number }>): number {
  const lots: Array<{ qty: number; price: number }> = [];
  let total = 0;
  for (const trade of trades) {
    if (trade.side === "BUY") { lots.push({ qty: trade.qty, price: trade.price }); continue; }
    let remaining = trade.qty;
    while (remaining > 0 && lots.length > 0) {
      const lot = lots[0];
      const matched = Math.min(remaining, lot.qty);
      total += (trade.price - lot.price) * matched;
      remaining -= matched;
      lot.qty -= matched;
      if (lot.qty === 0) lots.shift();
    }
  }
  return total;
}

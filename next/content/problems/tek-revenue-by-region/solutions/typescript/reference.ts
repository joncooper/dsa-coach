export function revenueByRegion(customers: Array<{ id: number; region: string }>, orders: Array<{ customer_id: number; amount: number }>): Record<string, number> {
  const regionOf = new Map<number, string>();
  for (const customer of customers) regionOf.set(customer.id, customer.region);
  const totals: Record<string, number> = {};
  for (const order of orders) {
    const region = regionOf.get(order.customer_id);
    if (region === undefined) continue;
    totals[region] = (totals[region] ?? 0) + order.amount;
  }
  return totals;
}

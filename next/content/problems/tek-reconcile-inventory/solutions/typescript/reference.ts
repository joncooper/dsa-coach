export function reconcileInventory(expected: Record<string, number>, observed: Record<string, number>): Array<[string, string, number, number, number]> {
  const rows: Array<[string, string, number, number, number]> = [];
  const skus = [...new Set([...Object.keys(expected), ...Object.keys(observed)])].sort();
  for (const sku of skus) {
    const inExp = Object.hasOwn(expected, sku);
    const inObs = Object.hasOwn(observed, sku);
    const expQty = expected[sku] ?? 0;
    const obsQty = observed[sku] ?? 0;
    const delta = obsQty - expQty;
    if (!inObs) rows.push([sku, "missing", expQty, 0, delta]);
    else if (!inExp) rows.push([sku, "extra", 0, obsQty, delta]);
    else if (obsQty < expQty) rows.push([sku, "short", expQty, obsQty, delta]);
    else if (obsQty > expQty) rows.push([sku, "over", expQty, obsQty, delta]);
  }
  return rows;
}

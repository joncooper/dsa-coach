from collections import defaultdict, deque

def realized_pnl_by_symbol(trades):
    lots = defaultdict(deque)
    totals = {}
    for trade in trades:
        symbol = trade["symbol"]
        qty = trade["qty"]
        price = trade["price"]
        if trade["side"] == "BUY":
            lots[symbol].append([qty, price])
            continue
        if symbol not in totals:
            totals[symbol] = 0
        remaining = qty
        while remaining > 0 and lots[symbol]:
            lot_qty, lot_price = lots[symbol][0]
            matched = min(remaining, lot_qty)
            totals[symbol] += (price - lot_price) * matched
            remaining -= matched
            if matched == lot_qty:
                lots[symbol].popleft()
            else:
                lots[symbol][0][0] = lot_qty - matched
    return totals

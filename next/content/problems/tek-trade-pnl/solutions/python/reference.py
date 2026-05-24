def realized_pnl(trades: list[dict]) -> int:
    lots = []
    total = 0
    for trade in trades:
        if trade['side'] == 'BUY':
            lots.append([trade['qty'], trade['price']])
            continue
        remaining = trade['qty']
        while remaining > 0 and lots:
            lot_qty, lot_price = lots[0]
            matched = min(remaining, lot_qty)
            total += (trade['price'] - lot_price) * matched
            remaining -= matched
            if matched == lot_qty:
                lots.pop(0)
            else:
                lots[0][0] = lot_qty - matched
    return total

def apply_transactions(starting_balances: dict, transactions: list[dict]) -> list[object]:
    balances = dict(starting_balances)
    rejected = []
    for index, txn in enumerate(transactions):
        kind = txn.get('type')
        amount = txn.get('amount', 0)
        if kind == 'DEPOSIT':
            account = txn.get('account')
            if account in balances:
                balances[account] += amount
            else:
                rejected.append(index)
        elif kind == 'WITHDRAW':
            account = txn.get('account')
            if account in balances and balances[account] >= amount:
                balances[account] -= amount
            else:
                rejected.append(index)
        elif kind == 'TRANSFER':
            src = txn.get('from')
            dst = txn.get('to')
            if src in balances and dst in balances and balances[src] >= amount:
                balances[src] -= amount
                balances[dst] += amount
            else:
                rejected.append(index)
        else:
            rejected.append(index)
    return [balances, rejected]

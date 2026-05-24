def assign_snacks(appetites: list[int], snacks: list[int]) -> int:
    appetites = sorted(appetites)
    snacks = sorted(snacks)
    child = 0
    for snack in snacks:
        if child < len(appetites) and snack >= appetites[child]:
            child += 1
    return child

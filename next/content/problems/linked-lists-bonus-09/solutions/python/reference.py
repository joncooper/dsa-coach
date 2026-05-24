def odd_even_list(values: list[int]) -> list[int]:
    odds = []
    evens = []
    for index, value in enumerate(values):
        if index % 2 == 0:
            odds.append(value)
        else:
            evens.append(value)
    return odds + evens

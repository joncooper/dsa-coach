def everyone_yes_sum(input_text):
    total = 0
    for block in input_text.split("\n\n"):
        persons = [line.strip() for line in block.split("\n") if line.strip()]
        if not persons:
            continue
        intersection = set(persons[0])
        for person in persons[1:]:
            intersection &= set(person)
        total += len(intersection)
    return total

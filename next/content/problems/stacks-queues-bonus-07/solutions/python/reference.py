def hot_potato(players: list[object], passes: int) -> object:
    queue = list(players)
    while len(queue) > 1:
        for _ in range(passes):
            queue.append(queue.pop(0))
        queue.pop(0)
    return queue[0]

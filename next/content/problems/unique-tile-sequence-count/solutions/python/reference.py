def unique_tile_sequence_count(tiles: str) -> int:
    counts = {}
    for tile in tiles:
        counts[tile] = counts.get(tile, 0) + 1
    letters = sorted(counts)
    def dfs():
        total = 0
        for letter in letters:
            if counts[letter] == 0:
                continue
            counts[letter] -= 1
            total += 1 + dfs()
            counts[letter] += 1
        return total
    return dfs()

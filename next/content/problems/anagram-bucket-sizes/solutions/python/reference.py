def anagram_bucket_sizes(words: list[str]) -> list[int]:
    buckets = {}
    for word in words:
        key = "".join(sorted(word))
        buckets[key] = buckets.get(key, 0) + 1
    return sorted(buckets.values())

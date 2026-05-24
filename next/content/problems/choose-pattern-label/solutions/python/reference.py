def choose_pattern_label(features: list[str]) -> str:
    text = ' '.join(feature.lower() for feature in features)
    groups = [
        ('graph', ['node', 'edge', 'shortest', 'connected']),
        ('dp', ['subproblem', 'reuse', 'minimum', 'optimal']),
        ('binary-search', ['sorted', 'boundary', 'answer']),
        ('sliding-window', ['contiguous', 'window', 'at most', 'positive']),
    ]
    for label, needles in groups:
        if any(needle in text for needle in needles):
            return label
    return 'hashing'

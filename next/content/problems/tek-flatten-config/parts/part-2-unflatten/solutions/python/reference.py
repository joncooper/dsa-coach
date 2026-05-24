def unflatten_config(flat):
    root = {}
    for path, value in flat.items():
        segments = path.split(".")
        node = root
        for seg in segments[:-1]:
            node = node.setdefault(seg, {})
        node[segments[-1]] = value
    return root

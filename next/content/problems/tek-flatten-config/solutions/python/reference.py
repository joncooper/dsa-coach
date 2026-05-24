def flatten_config(config: dict) -> dict:
    out = {}
    def walk(node, prefix):
        for key, value in node.items():
            path = prefix + '.' + key if prefix else key
            if isinstance(value, dict):
                walk(value, path)
            else:
                out[path] = value
    walk(config, '')
    return out

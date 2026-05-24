def render_template(template: str, values: dict) -> str:
    import re
    pattern = re.compile(r'\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}')
    def repl(match):
        name = match.group(1)
        return str(values[name]) if name in values else match.group(0)
    return pattern.sub(repl, template)

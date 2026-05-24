def permit_counts_by_stage(input_text):
    out = {"main": 0, "side": 0, "late": 0}
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(" ")
        if len(parts) != 3:
            continue
        stage, license_value, expires = parts
        if stage not in out:
            continue
        if len(license_value) != 11 or license_value[3] != "-" or license_value[6] != "-":
            continue
        groups = license_value.split("-")
        if (len(groups[0]), len(groups[1]), len(groups[2])) != (3, 2, 4):
            continue
        if not all(g.isdigit() for g in groups):
            continue
        if not (expires.isdigit() and len(expires) == 4 and int(expires) >= 2025):
            continue
        out[stage] += 1
    return out

def count_valid_permits(input_text):
    valid = 0
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(" ")
        if len(parts) != 3:
            continue
        _, license_value, expires = parts
        if len(license_value) != 11 or license_value[3] != "-" or license_value[6] != "-":
            continue
        groups = license_value.split("-")
        if len(groups) != 3 or not (groups[0].isdigit() and groups[1].isdigit() and groups[2].isdigit()):
            continue
        if (len(groups[0]), len(groups[1]), len(groups[2])) != (3, 2, 4):
            continue
        if not (expires.isdigit() and len(expires) == 4 and int(expires) >= 2025):
            continue
        valid += 1
    return valid

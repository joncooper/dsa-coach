def valid_cipher_count(input_text):
    valid = 0
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(" ")
        if len(parts) != 3:
            continue
        _, code, status = parts
        if status != "ok":
            continue
        has_letter = any(c.isalpha() for c in code)
        has_digit = any(c.isdigit() for c in code)
        if has_letter and has_digit:
            valid += 1
    return valid

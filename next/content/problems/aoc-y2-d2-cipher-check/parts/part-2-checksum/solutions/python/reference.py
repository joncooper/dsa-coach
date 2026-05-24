def cipher_checksum(input_text):
    total = 0
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(" ")
        if len(parts) != 3:
            continue
        kind, code, status = parts
        if status != "ok":
            continue
        has_letter = any(c.isalpha() for c in code)
        has_digit = any(c.isdigit() for c in code)
        if not (has_letter and has_digit):
            continue
        if kind == "cargo":
            run = 0
            for ch in code:
                if ch.isdigit():
                    run = run * 10 + int(ch)
                else:
                    break
            total += run
        elif kind == "text":
            total += sum(1 for ch in code if ch.isalpha())
        elif kind == "ledger":
            total += sum(int(ch) for ch in code if ch.isdigit())
    return total

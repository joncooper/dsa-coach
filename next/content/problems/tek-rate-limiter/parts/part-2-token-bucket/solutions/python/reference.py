def token_bucket_rate_limited(events, capacity, refill_period):
    state = {}
    out = []
    for timestamp, user_id in events:
        if user_id not in state:
            state[user_id] = [capacity, timestamp]
        bucket = state[user_id]
        tokens, last_refill = bucket
        elapsed = timestamp - last_refill
        if elapsed > 0 and refill_period > 0:
            refills = elapsed // refill_period
            if refills > 0:
                tokens = min(capacity, tokens + refills)
                last_refill += refills * refill_period
        if tokens >= 1:
            tokens -= 1
            out.append(True)
        else:
            out.append(False)
        bucket[0] = tokens
        bucket[1] = last_refill
    return out

def recent_active_users(timestamps: list[int], users: list[str], window: int) -> list[int]:
    left = 0
    counts_by_user = {}
    results = []

    for right, timestamp in enumerate(timestamps):
        user = users[right]
        counts_by_user[user] = counts_by_user.get(user, 0) + 1

        while timestamps[left] < timestamp - window:
            old_user = users[left]
            counts_by_user[old_user] -= 1
            if counts_by_user[old_user] == 0:
                del counts_by_user[old_user]
            left += 1

        results.append(len(counts_by_user))

    return results

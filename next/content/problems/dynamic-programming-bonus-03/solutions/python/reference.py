def count_decodings(text: str) -> int:
    if not text or text[0] == '0':
        return 0
    dp = [0] * (len(text) + 1)
    dp[0] = 1
    dp[1] = 1
    for index in range(2, len(text) + 1):
        one = int(text[index - 1:index])
        two = int(text[index - 2:index])
        if one >= 1:
            dp[index] += dp[index - 1]
        if 10 <= two <= 26:
            dp[index] += dp[index - 2]
    return dp[len(text)]

from collections import deque


def fetch_url(url: str) -> object:
    raise RuntimeError("fetch_url is provided by the test harness")


def read_with_retries(url: str, max_retries: int) -> object | None:
    for attempt in range(max_retries + 1):
        response = fetch_url(url)
        if isinstance(response, dict) and response.get("status") == 503:
            if attempt == max_retries:
                return None
            continue
        return response
    return None


def find_final_url(start_url: str, max_retries: int) -> str | None:
    queue = deque([start_url])
    seen = {start_url}

    while queue:
        url = queue.popleft()
        response = read_with_retries(url, max_retries)

        if response == "congrats":
            return url

        if not isinstance(response, dict):
            continue

        urls = response.get("urls")
        if not isinstance(urls, list):
            continue

        for next_url in urls:
            if isinstance(next_url, str) and next_url not in seen:
                seen.add(next_url)
                queue.append(next_url)

    return None

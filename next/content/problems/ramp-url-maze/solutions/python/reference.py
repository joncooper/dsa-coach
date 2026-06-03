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

        if response == "congrats" or response_body(response) == "congrats":
            return url

        for next_url in next_urls_from(response):
            if isinstance(next_url, str) and next_url not in seen:
                seen.add(next_url)
                queue.append(next_url)

    return None


def next_urls_from(response: object) -> list[str]:
    if not isinstance(response, dict):
        return []

    if response.get("status") in (301, 302):
        location = response.get("location")
        return [location] if isinstance(location, str) else []

    body = response.get("body") if response.get("status") == 200 else response
    if not isinstance(body, dict):
        return []

    urls = body.get("urls")
    if not isinstance(urls, list):
        return []

    return [url for url in urls if isinstance(url, str)]


def response_body(response: object) -> object | None:
    if isinstance(response, dict) and response.get("status") == 200:
        return response.get("body")
    return None

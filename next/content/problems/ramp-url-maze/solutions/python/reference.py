from collections import deque


def find_exit_url(pages: list[list[object]], start: str, max_retries: int) -> str:
    by_url = {}
    for url, kind, payload, failures in pages:
        by_url[str(url)] = {
            "kind": str(kind),
            "payload": payload,
            "failures": int(failures),
        }

    queue = deque([start])
    visited = set()
    attempts = {}

    while queue:
        url = queue.popleft()
        if url in visited:
            continue

        page = by_url.get(url)
        if page is None:
            continue

        attempt = attempts.get(url, 0)
        if attempt < page["failures"]:
            attempts[url] = attempt + 1
            if attempts[url] <= max_retries:
                queue.append(url)
            continue

        visited.add(url)
        if page["kind"] == "EXIT":
            return url
        if page["kind"] != "LINKS":
            continue

        for next_url in page["payload"]:
            next_url = str(next_url)
            if next_url not in visited:
                queue.append(next_url)

    return ""

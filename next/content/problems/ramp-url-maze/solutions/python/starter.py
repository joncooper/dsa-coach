def fetch_url(url: str) -> object:
    raise RuntimeError("fetch_url is provided by the test harness")


def find_final_url(start_url: str, max_retries: int) -> str | None:
    raise NotImplementedError

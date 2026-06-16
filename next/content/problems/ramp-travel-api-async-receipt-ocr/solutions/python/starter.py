import travel_api


async def batch_ocr_receipts(
    base_url: str,
    token: str,
    receipt_ids: list[str],
    max_concurrency: int,
) -> list[dict]:
    """OCR receipts with bounded concurrency and per-receipt error rows."""
    raise NotImplementedError

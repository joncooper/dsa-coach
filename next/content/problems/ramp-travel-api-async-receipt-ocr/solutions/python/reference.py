import asyncio
import travel_api


async def batch_ocr_receipts(
    base_url: str,
    token: str,
    receipt_ids: list[str],
    max_concurrency: int,
) -> list[dict]:
    semaphore = asyncio.Semaphore(max(1, int(max_concurrency)))

    async def process_one(receipt_id: str) -> dict:
        async with semaphore:
            try:
                ocr = await travel_api.ocr_receipt(base_url, token, receipt_id)
            except travel_api.TravelApiError as error:
                return {
                    "receipt_id": receipt_id,
                    "status": "error",
                    "error": str(error),
                }
            return {
                "receipt_id": receipt_id,
                "status": "ok",
                "text": ocr["text"],
                "amount_cents": ocr["amount_cents"],
            }

    return await asyncio.gather(*(process_one(receipt_id) for receipt_id in receipt_ids))

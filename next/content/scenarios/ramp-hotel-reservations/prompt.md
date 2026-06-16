You are extending a small in-memory hotel reservation service.

This is a no-AI onsite coding rehearsal. Use Codex in this screen as an interviewer/coach, not as an implementation autopilot. Ask it for pressure tests, clarifying questions, and debugging direction; keep the coding decisions yours.

The starter code was written for a first demo. It can add rooms and create very naive reservations, but it does not yet enforce the real booking rules.

Your job is to extend `src/reservations.py` so `run_operations(operations)` supports the full API.

## Operations

Each operation is a list of strings. Return one string per operation.

- `["ADD_ROOM", timestamp, room_id, room_type]`: add a room. Return `"true"` if added, or `"false"` if the room id already exists.
- `["BOOK", timestamp, guest_id, room_type, check_in, check_out]`: reserve any available room of `room_type`. Return the new reservation id, or `""` if no room is available or the date range is invalid.
- `["CANCEL", timestamp, reservation_id]`: cancel an active reservation. Return `"true"` if it existed and was active, otherwise `"false"`.
- `["GET", timestamp, reservation_id]`: return `"guest_id|room_id|check_in|check_out"` for an active reservation, or `""` if missing or canceled.
- `["AVAILABLE", timestamp, room_type, check_in, check_out]`: return the number of rooms of that type available for the requested stay, as a string. Return `"0"` for invalid date ranges.
- `["GUEST_RESERVATIONS", timestamp, guest_id]`: return that guest's active reservation ids sorted by check-in date ascending, then reservation creation order ascending. Join with commas; return `""` when empty.

## Rules

- Reservation ids are `res_1`, `res_2`, and so on.
- Failed bookings do not consume reservation ids.
- Dates are `YYYY-MM-DD`.
- Stays are half-open intervals: `[check_in, check_out)`.
- A room booked through `2026-07-03` can be booked again starting `2026-07-03`.
- A date range is invalid when `check_out <= check_in`.
- When several rooms of the requested type are available, choose the room with the earliest room creation order.
- Canceled reservations should no longer block rooms, appear in `GET`, or appear in `GUEST_RESERVATIONS`.

## Interview Guidance

Start with a clear state model. Keep mutation paths centralized. The interviewer is looking for:

- contract clarity,
- explicit interval-overlap logic,
- deterministic assignment,
- active vs canceled state,
- indexes that make lookups simple,
- visible-test-driven debugging,
- and a concise final explanation.


def hotel_reservations(operations: list[list[str]]) -> list[str]:
    rooms = {}
    reservations = {}
    reservation_ids_by_room = {}
    reservation_ids_by_guest = {}
    results = []
    next_room_order = 0
    next_reservation_id = 1

    for operation in operations:
        kind = operation[0]

        if kind == "ADD_ROOM":
            _, _timestamp, room_id, room_type = operation
            if room_id in rooms:
                results.append("false")
                continue

            rooms[room_id] = {
                "id": room_id,
                "type": room_type,
                "order": next_room_order,
            }
            reservation_ids_by_room[room_id] = []
            next_room_order += 1
            results.append("true")

        elif kind == "BOOK":
            _, _timestamp, guest_id, room_type, check_in, check_out = operation
            if not valid_range(check_in, check_out):
                results.append("")
                continue

            room_id = first_available_room(rooms, reservations, reservation_ids_by_room, room_type, check_in, check_out)
            if room_id is None:
                results.append("")
                continue

            reservation_id = f"res_{next_reservation_id}"
            next_reservation_id += 1
            reservations[reservation_id] = {
                "id": reservation_id,
                "guest_id": guest_id,
                "room_id": room_id,
                "check_in": check_in,
                "check_out": check_out,
                "order": next_reservation_id,
                "active": True,
            }
            reservation_ids_by_room[room_id].append(reservation_id)
            reservation_ids_by_guest.setdefault(guest_id, []).append(reservation_id)
            results.append(reservation_id)

        elif kind == "CANCEL":
            _, _timestamp, reservation_id = operation
            reservation = reservations.get(reservation_id)
            if reservation is None or not reservation["active"]:
                results.append("false")
            else:
                reservation["active"] = False
                results.append("true")

        elif kind == "GET":
            _, _timestamp, reservation_id = operation
            reservation = reservations.get(reservation_id)
            if reservation is None or not reservation["active"]:
                results.append("")
            else:
                results.append(
                    "|".join([
                        reservation["guest_id"],
                        reservation["room_id"],
                        reservation["check_in"],
                        reservation["check_out"],
                    ])
                )

        elif kind == "AVAILABLE":
            _, _timestamp, room_type, check_in, check_out = operation
            if not valid_range(check_in, check_out):
                results.append("0")
            else:
                available = available_rooms(rooms, reservations, reservation_ids_by_room, room_type, check_in, check_out)
                results.append(str(len(available)))

        elif kind == "GUEST_RESERVATIONS":
            _, _timestamp, guest_id = operation
            active = [
                reservations[reservation_id]
                for reservation_id in reservation_ids_by_guest.get(guest_id, [])
                if reservations[reservation_id]["active"]
            ]
            active.sort(key=lambda reservation: (reservation["check_in"], reservation["order"]))
            results.append(",".join(reservation["id"] for reservation in active))

    return results


def valid_range(check_in: str, check_out: str) -> bool:
    return check_in < check_out


def overlaps(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    return start_a < end_b and start_b < end_a


def available_rooms(rooms, reservations, reservation_ids_by_room, room_type, check_in, check_out):
    room_list = sorted(
        (room for room in rooms.values() if room["type"] == room_type),
        key=lambda room: room["order"],
    )
    return [
        room
        for room in room_list
        if not room_has_overlap(room["id"], reservations, reservation_ids_by_room, check_in, check_out)
    ]


def first_available_room(rooms, reservations, reservation_ids_by_room, room_type, check_in, check_out):
    available = available_rooms(rooms, reservations, reservation_ids_by_room, room_type, check_in, check_out)
    return available[0]["id"] if available else None


def room_has_overlap(room_id, reservations, reservation_ids_by_room, check_in, check_out):
    for reservation_id in reservation_ids_by_room.get(room_id, []):
        reservation = reservations[reservation_id]
        if not reservation["active"]:
            continue
        if overlaps(check_in, check_out, reservation["check_in"], reservation["check_out"]):
            return True
    return False

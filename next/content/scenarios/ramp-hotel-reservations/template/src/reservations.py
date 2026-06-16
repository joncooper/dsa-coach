class HotelReservationService:
    def __init__(self):
        self.rooms = {}
        self.room_order = []
        self.reservations = {}
        self.next_reservation_number = 1

    def add_room(self, room_id, room_type):
        if room_id in self.rooms:
            return "false"
        self.rooms[room_id] = {"id": room_id, "type": room_type}
        self.room_order.append(room_id)
        return "true"

    def book(self, guest_id, room_type, check_in, check_out):
        # First-demo implementation: it picks the first room of the type.
        # TODO: validate ranges and skip rooms with overlapping active stays.
        for room_id in self.room_order:
            if self.rooms[room_id]["type"] != room_type:
                continue
            reservation_id = f"res_{self.next_reservation_number}"
            self.next_reservation_number += 1
            self.reservations[reservation_id] = {
                "id": reservation_id,
                "guest_id": guest_id,
                "room_id": room_id,
                "check_in": check_in,
                "check_out": check_out,
                "active": True,
            }
            return reservation_id
        return ""

    def cancel(self, reservation_id):
        # TODO: active reservations should be cancelable exactly once.
        return "false"

    def get(self, reservation_id):
        reservation = self.reservations.get(reservation_id)
        if reservation is None or not reservation["active"]:
            return ""
        return "|".join([
            reservation["guest_id"],
            reservation["room_id"],
            reservation["check_in"],
            reservation["check_out"],
        ])

    def available(self, room_type, check_in, check_out):
        # TODO: count only rooms whose active reservations do not overlap.
        return str(sum(1 for room_id in self.room_order if self.rooms[room_id]["type"] == room_type))

    def guest_reservations(self, guest_id):
        # TODO: return active reservation ids sorted by check-in date, then creation order.
        return ""


def run_operations(operations):
    service = HotelReservationService()
    results = []

    for operation in operations:
        kind = operation[0]
        if kind == "ADD_ROOM":
            _, _timestamp, room_id, room_type = operation
            results.append(service.add_room(room_id, room_type))
        elif kind == "BOOK":
            _, _timestamp, guest_id, room_type, check_in, check_out = operation
            results.append(service.book(guest_id, room_type, check_in, check_out))
        elif kind == "CANCEL":
            _, _timestamp, reservation_id = operation
            results.append(service.cancel(reservation_id))
        elif kind == "GET":
            _, _timestamp, reservation_id = operation
            results.append(service.get(reservation_id))
        elif kind == "AVAILABLE":
            _, _timestamp, room_type, check_in, check_out = operation
            results.append(service.available(room_type, check_in, check_out))
        elif kind == "GUEST_RESERVATIONS":
            _, _timestamp, guest_id = operation
            results.append(service.guest_reservations(guest_id))

    return results


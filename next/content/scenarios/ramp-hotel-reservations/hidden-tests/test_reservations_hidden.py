import unittest

from src.reservations import run_operations


class HotelReservationHiddenTests(unittest.TestCase):
    def test_invalid_ranges_do_not_consume_ids(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["BOOK", "2", "guest_a", "queen", "2026-07-03", "2026-07-03"],
            ["BOOK", "3", "guest_a", "queen", "2026-07-04", "2026-07-03"],
            ["BOOK", "4", "guest_b", "queen", "2026-07-04", "2026-07-05"],
            ["AVAILABLE", "5", "queen", "2026-07-05", "2026-07-05"],
        ])
        self.assertEqual(result, ["true", "", "", "res_1", "0"])

    def test_uses_room_creation_order_not_room_id_order(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_b", "queen"],
            ["ADD_ROOM", "2", "room_a", "queen"],
            ["BOOK", "3", "guest_a", "queen", "2026-07-01", "2026-07-02"],
            ["GET", "4", "res_1"],
        ])
        self.assertEqual(result, [
            "true",
            "true",
            "res_1",
            "guest_a|room_b|2026-07-01|2026-07-02",
        ])

    def test_canceled_reservation_leaves_guest_index(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["ADD_ROOM", "2", "room_102", "queen"],
            ["BOOK", "3", "guest_a", "queen", "2026-07-01", "2026-07-03"],
            ["BOOK", "4", "guest_a", "queen", "2026-07-05", "2026-07-06"],
            ["CANCEL", "5", "res_1"],
            ["GUEST_RESERVATIONS", "6", "guest_a"],
            ["CANCEL", "7", "res_1"],
        ])
        self.assertEqual(result, ["true", "true", "res_1", "res_2", "true", "res_2", "false"])

    def test_two_rooms_one_overlapping_booking_gets_second_room(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["ADD_ROOM", "2", "room_102", "queen"],
            ["BOOK", "3", "guest_a", "queen", "2026-07-01", "2026-07-05"],
            ["BOOK", "4", "guest_b", "queen", "2026-07-02", "2026-07-03"],
            ["GET", "5", "res_2"],
            ["AVAILABLE", "6", "queen", "2026-07-02", "2026-07-03"],
        ])
        self.assertEqual(result, [
            "true",
            "true",
            "res_1",
            "res_2",
            "guest_b|room_102|2026-07-02|2026-07-03",
            "0",
        ])


if __name__ == "__main__":
    unittest.main()


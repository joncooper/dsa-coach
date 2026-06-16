import unittest

from src.reservations import run_operations


class HotelReservationVisibleTests(unittest.TestCase):
    def test_add_get_and_basic_booking(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["BOOK", "2", "guest_a", "queen", "2026-07-01", "2026-07-03"],
            ["GET", "3", "res_1"],
        ])
        self.assertEqual(result, [
            "true",
            "res_1",
            "guest_a|room_101|2026-07-01|2026-07-03",
        ])

    def test_overlap_blocks_single_room(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["BOOK", "2", "guest_a", "queen", "2026-07-01", "2026-07-03"],
            ["BOOK", "3", "guest_b", "queen", "2026-07-02", "2026-07-04"],
            ["AVAILABLE", "4", "queen", "2026-07-02", "2026-07-04"],
        ])
        self.assertEqual(result, ["true", "res_1", "", "0"])

    def test_back_to_back_stays_can_share_room(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "queen"],
            ["BOOK", "2", "guest_a", "queen", "2026-07-01", "2026-07-03"],
            ["BOOK", "3", "guest_b", "queen", "2026-07-03", "2026-07-05"],
            ["GET", "4", "res_2"],
        ])
        self.assertEqual(result, [
            "true",
            "res_1",
            "res_2",
            "guest_b|room_101|2026-07-03|2026-07-05",
        ])

    def test_cancel_frees_room(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "king"],
            ["BOOK", "2", "guest_a", "king", "2026-08-01", "2026-08-05"],
            ["AVAILABLE", "3", "king", "2026-08-02", "2026-08-04"],
            ["CANCEL", "4", "res_1"],
            ["AVAILABLE", "5", "king", "2026-08-02", "2026-08-04"],
            ["GET", "6", "res_1"],
        ])
        self.assertEqual(result, ["true", "res_1", "0", "true", "1", ""])

    def test_guest_reservations_sorted(self):
        result = run_operations([
            ["ADD_ROOM", "1", "room_101", "suite"],
            ["ADD_ROOM", "2", "room_102", "suite"],
            ["BOOK", "3", "guest_a", "suite", "2026-09-10", "2026-09-12"],
            ["BOOK", "4", "guest_a", "suite", "2026-09-01", "2026-09-02"],
            ["GUEST_RESERVATIONS", "5", "guest_a"],
        ])
        self.assertEqual(result, ["true", "true", "res_1", "res_2", "res_2,res_1"])


if __name__ == "__main__":
    unittest.main()


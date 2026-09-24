import unittest
from boundary_audit import audit, characterize


class BoundaryAuditTests(unittest.TestCase):
    def run_record(self, **captures):
        return audit({'episode_id': 'synthetic-only', 'attempt_id': 'one', 'boundaries': captures})

    def test_missing_is_distinct_from_observed_empty(self):
        r = self.run_record(provider_ingress='A\u0336', application_return=None, stored_history='')
        self.assertIsNone(r['captures']['application_return'])
        self.assertEqual(r['captures']['stored_history']['code_points'], 0)
        self.assertEqual(r['first_observed_change']['unobserved_between'], ['application_return'])

    def test_astral_offset_uses_scalars(self):
        r = self.run_record(provider_ingress='\U0010d613A\u0336', application_return='\U0010d613A')
        self.assertEqual(r['first_observed_change']['first_difference'],
                         {'code_point_offset': 2, 'before': 'U+0336', 'after': None})

    def test_equal_text_carries_no_claim_about_pixels(self):
        r = self.run_record(provider_ingress='A\u030b\u0325 ⟐', dom_text='A\u030b\u0325 ⟐')
        self.assertIsNone(r['first_observed_change'])
        self.assertTrue(r['intervals'][0]['equal_decoded_text'])

    def test_normalization_difference_remains_recorded(self):
        r = self.run_record(provider_ingress='e\u0301', application_return='é')
        self.assertTrue(r['first_observed_change']['nfc_equivalent'])
        self.assertEqual(r['first_observed_change']['net_mark_count_change'], -1)

    def test_no_capture_is_unknown_not_plain(self):
        r = self.run_record()
        self.assertEqual(r['intervals'], [])
        self.assertTrue(all(v is None for v in r['captures'].values()))

    def test_mark_beyond_basic_combining_block(self):
        self.assertEqual(characterize('x\u1dcd')['mark_count'], 1)

    def test_invalid_capture_rejected(self):
        with self.assertRaises(ValueError):
            self.run_record(provider_ingress={'text': 'X'})
        with self.assertRaises(ValueError):
            self.run_record(unknown='X')

    def test_same_length_replacement_is_detected(self):
        r = self.run_record(provider_ingress='A\u0301', application_return='A\u0300')
        self.assertIsNotNone(r['first_observed_change'])
        self.assertEqual(r['first_observed_change']['net_mark_count_change'], 0)


if __name__ == '__main__':
    unittest.main()

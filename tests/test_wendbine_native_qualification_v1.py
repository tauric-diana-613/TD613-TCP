import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('wendbine_numeric_qualification',ROOT/'scripts/wendbine-live-research-index-v1.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)


def post(created):
    return {'id':'abcde1','author':m.AUTHOR,'subreddit':m.COMMUNITY,'title':'Fictional title',
            'selftext':'Fictional body','created_utc':created}


class PublicationDateControls(unittest.TestCase):
    def test_realistic_integer_and_fractional_seconds_preserved(self):
        self.assertEqual(m.validate_post(post(1790000000))['published_unix'],1790000000)
        self.assertEqual(m.validate_post(post(1790000000.75))['published_unix'],1790000000)

    def test_nonfinite_boolean_and_overflow_dates_refused(self):
        for value in (True,float('inf'),float('-inf'),float('nan'),1e308,0,-1):
            with self.subTest(value=value),self.assertRaisesRegex(ValueError,'INVALID_PUBLICATION_DATE'):
                m.validate_post(post(value))


class DeclaredOrderingFixture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec=importlib.util.spec_from_file_location('wendbine_scab_qualification',ROOT/'scripts/wendbine-ordering-sensitivity-v1.py')
        cls.scab=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.scab)

    def test_terminal_equivalence_and_intermediate_distinction(self):
        r=self.scab.reproduce()
        self.assertEqual((r['permutations'],r['terminal_signature_classes'],r['canonical_equivalence_class_size']),(24,5,9))
        self.assertTrue(r['selected_pair_terminal_equal'])
        self.assertNotEqual(r['selected_pair_first_stage_input_3']['KPAN'],r['selected_pair_first_stage_input_3']['AKPN'])
        self.assertFalse(r['external_system_claim'])

    def test_commuting_control(self):
        self.assertEqual(self.scab.reproduce()['commuting_control_signature_classes'],1)

    def test_invalid_stage_order_refused(self):
        with self.assertRaises(ValueError):self.scab.trace('KKAN',3)


if __name__=='__main__':unittest.main()

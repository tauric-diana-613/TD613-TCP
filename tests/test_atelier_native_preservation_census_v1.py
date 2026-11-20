import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("native_inventory",ROOT/"scripts"/"atelier-native-preservation-census-v1.py")
native=importlib.util.module_from_spec(spec)
spec.loader.exec_module(native)

class NativePreservation(unittest.TestCase):
    def test_actual_pinned_src_engine_graph_topology_and_routing_assets(self):
        row=native.audit("SRC")
        self.assertEqual(row["pinned_head"],"b3e69acf587d534eeef2e01d0bb5bdbdecdbd320")
        self.assertEqual(row["original_asset_count"],13)
        self.assertTrue(all(x["byte_length"]>0 for x in row["exact_native_git_objects"]))
        self.assertEqual(row["functional_port_parity"],"NOT_EARNED_BY_INVENTORY")
        self.assertIn("05-OPERATIONS/phase2/claim-evidence-tomography.jsonl",
                      [x["path"] for x in row["exact_native_git_objects"]][10])

    def test_actual_pinned_em_lineage_original_inventory_and_seven_batch_b_records(self):
        row=native.audit("EMSTD613")
        self.assertEqual(row["pinned_head"],"70b5a0f9e94626cba6068f41c6117e7978800bbd")
        self.assertEqual(row["original_asset_count"],12)
        self.assertTrue(all(x["byte_length"]>0 for x in row["exact_native_git_objects"]))
        self.assertEqual(row["functional_port_parity"],"NOT_EARNED_BY_INVENTORY")
        self.assertTrue(any("batch-b-2026-09-11-source-files-v2.jsonl" in x["path"]
                           for x in row["exact_native_git_objects"]))

    def test_unregistered_estate_refused(self):
        self.assertRaisesRegex(ValueError,"UNREGISTERED_ESTATE",native.audit,"WENDBINE")

if __name__=="__main__":unittest.main()

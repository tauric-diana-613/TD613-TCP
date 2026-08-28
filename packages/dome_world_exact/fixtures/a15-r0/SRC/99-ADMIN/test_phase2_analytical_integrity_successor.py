import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("phase2-analytical-integrity-successor.py")
SPEC = importlib.util.spec_from_file_location("phase2_analytical_integrity_successor", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


def write_jsonl(path: Path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row) + "\n" for row in records), encoding="utf-8")


class AnalyticalIntegritySuccessorTests(unittest.TestCase):
    def make_root(self):
        temporary = tempfile.TemporaryDirectory()
        return temporary, Path(temporary.name)

    def test_current_seal_outranks_absent_optional_sqlite(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_json(root / "04-RECEIPTS/phase2/current-seal.json", {
            "atelier_snapshot_id": "S1",
            "seal_id": "seal:1",
        })
        self.assertFalse((root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3").exists())
        epoch = module.query_epoch(root)
        self.assertEqual(epoch["atelier_snapshot_id"], "S1")
        self.assertEqual(epoch["seal_id"], "seal:1")
        self.assertEqual(epoch["basis"], "CURRENT_SEAL")

    def test_null_namespaces_remain_local_to_series_observation(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/ordinal-series-observations.jsonl", [
            {
                "series_observation_id": "series-observation:a",
                "series_namespace_id": None,
                "stages": [{"ordinal": 2}],
                "evidence_ids": ["e:a"],
                "status": "ORDINAL_OBSERVED_NAMESPACE_UNRESOLVED",
            },
            {
                "series_observation_id": "series-observation:b",
                "series_namespace_id": None,
                "stages": [{"ordinal": 2}],
                "evidence_ids": ["e:b"],
                "status": "ORDINAL_OBSERVED_NAMESPACE_UNRESOLVED",
            },
        ])
        result = module.successor_expected_objects(root, "S1")
        gap_rows = [row for row in result if row["expected_ordinal"] == 1]
        self.assertEqual(len(gap_rows), 2)
        self.assertEqual(len({row["expected_object_id"] for row in gap_rows}), 2)
        self.assertEqual(len({row["expected_object_observation_id"] for row in gap_rows}), 2)
        self.assertEqual({row["identity_scope"] for row in gap_rows}, {"SERIES_OBSERVATION_LOCAL"})

    def test_resolved_namespace_can_share_object_without_sharing_observation(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/ordinal-series-observations.jsonl", [
            {
                "series_observation_id": "series-observation:a",
                "series_namespace_id": "series:shared",
                "stages": [{"ordinal": 2}],
                "evidence_ids": ["e:a"],
            },
            {
                "series_observation_id": "series-observation:b",
                "series_namespace_id": "series:shared",
                "stages": [{"ordinal": 2}],
                "evidence_ids": ["e:b"],
            },
        ])
        result = module.successor_expected_objects(root, "S1")
        self.assertEqual(len(result), 2)
        self.assertEqual(len({row["expected_object_id"] for row in result}), 1)
        self.assertEqual(len({row["expected_object_observation_id"] for row in result}), 2)
        self.assertEqual({row["identity_scope"] for row in result}, {"RESOLVED_NAMESPACE"})

    def test_zero_month_is_materialized_inside_bounded_axis(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/typed-edges.jsonl", [
            {"source_time": "2026-01-15", "relation": "A"},
            {"source_time": "2026-03-02", "relation": "B"},
            {"source_time": None, "relation": "C"},
        ])
        result = module.successor_publishing_regime(root, "S1")
        self.assertEqual([row["month"] for row in result], ["2026-01", "2026-02", "2026-03"])
        february = result[1]
        self.assertEqual(february["typed_edge_count"], 0)
        self.assertEqual(february["time_axis_state"], "EXPLICIT_ZERO_TYPED_EDGES_WITHIN_BOUNDED_RANGE")
        self.assertEqual(february["observation_domain"]["unparseable_source_time_count"], 1)

    def test_empty_work_domain_cannot_pass_noncollapse(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/entity-index.jsonl", [
            {"entity_id": "zenodo:1", "entity_kind": "MANIFESTATION"},
        ])
        write_jsonl(root / "05-OPERATIONS/phase2/evidence-unit-fingerprints.jsonl", [
            {"evidence_unit_id": "e:1"},
        ])
        write_jsonl(root / "05-OPERATIONS/relations/representation-families.jsonl", [
            {"family_id": "family:1"},
        ])
        write_jsonl(root / "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl", [
            {"authority_jurisdiction_assertion_id": "authority:1"},
        ])
        result = module.successor_noncollapse(root, "S1", [])
        self.assertEqual(result["domain_status"]["work"], "UNTESTED_EMPTY_DOMAIN")
        self.assertEqual(result["result"], "PARTIAL_UNTESTED_DIMENSION")

    def test_successor_refuses_sealed_output_directory(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        forbidden = root / "05-OPERATIONS/phase2"
        forbidden.mkdir(parents=True)
        with self.assertRaises(SystemExit):
            module.safe_output_dir(root, forbidden)


if __name__ == "__main__":
    unittest.main()

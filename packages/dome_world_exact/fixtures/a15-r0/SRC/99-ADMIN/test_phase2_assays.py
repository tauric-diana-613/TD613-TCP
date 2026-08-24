import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("build-phase2-assays.py")
SPEC = importlib.util.spec_from_file_location("build_phase2_assays", MODULE_PATH)
assays = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(assays)


def write_jsonl(path: Path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row) + "\n" for row in records), encoding="utf-8")


class Phase2AssayTests(unittest.TestCase):
    def make_root(self):
        temporary = tempfile.TemporaryDirectory()
        return temporary, Path(temporary.name)

    def test_missing_ordinal_becomes_unresolved_not_invented(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/ordinal-series-observations.jsonl", [{
            "series_namespace_id": "series:a",
            "stages": [{"ordinal": 2}, {"ordinal": 3}],
            "evidence_ids": ["e:1"],
            "status": "WITNESSED",
        }])
        result = assays.expected_objects(root, "S1")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["expected_ordinal"], 1)
        self.assertEqual(result[0]["state"], "OPEN_UNRESOLVED")
        self.assertEqual(result[0]["resolver_ids"], [])

    def test_role_is_compiler_contextual(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/recompilation-edges.jsonl", [{
            "edge_id": "edge:1",
            "from_id": "work:a",
            "declared_by_id": "compiler:b",
            "relation": "FOUNDATION_IN",
            "evidence_ids": ["e:1"],
            "scope": {"field": "x"},
            "adjudication_status": "WITNESSED",
        }])
        roles, compilers = assays.contextual_roles_and_compilers(root, "S1")
        self.assertEqual(roles[0]["subject_id"], "work:a")
        self.assertEqual(roles[0]["architecture_id"], "compiler:b")
        self.assertIn("not intrinsic", roles[0]["interpretive_limit"])
        self.assertEqual(compilers[0]["input_ids"], ["work:a"])

    def test_unresolved_compiler_key_is_not_invented(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "05-OPERATIONS/relations/compiler-input-candidates.jsonl", [{
            "compiler_candidate_id": "compiler-candidate:unresolved",
            "compiler_id": None,
            "input_slots": [{"slot": "I", "candidate_ids": ["work:a"]}],
            "adjudication_status": "UNRESOLVED",
        }])
        roles, compilers = assays.contextual_roles_and_compilers(root, "S1")
        self.assertEqual(roles, [])
        self.assertEqual(compilers, [])

    def test_identical_bodies_do_not_become_independent_evidence(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/phase2/derivative-v1.jsonl", [
            {"derivative_id": "d:1", "capture_id": "c:1", "output_sha256": "same"},
            {"derivative_id": "d:2", "capture_id": "c:2", "output_sha256": "same"},
        ])
        units, lineages = assays.evidence_interfaces(root, "S1")
        self.assertEqual(len(units), 2)
        self.assertEqual(lineages[0]["relationship"], "IDENTICAL")
        self.assertNotIn("INDEPENDENT", set(lineages[0]["independence_dimensions"].values()))
        self.assertIn("upstream_computation", lineages[0]["unresolved_shared_inputs"])

    def test_repeated_capture_is_preserved_without_source_mutation_claim(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        db_path = root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3"
        db_path.parent.mkdir(parents=True)
        db = sqlite3.connect(db_path)
        db.executescript("""
            CREATE TABLE targets(target_id TEXT PRIMARY KEY,capture_id TEXT);
            CREATE TABLE blobs(blob_id TEXT PRIMARY KEY,sha256 TEXT);
            CREATE TABLE captures(
              capture_id TEXT PRIMARY KEY,target_id TEXT,blob_id TEXT,captured_at TEXT,
              request_url TEXT,final_url TEXT,status_code INTEGER,headers_json TEXT,
              redirects_json TEXT,byte_length INTEGER,contextual_sha256 TEXT
            );
        """)
        db.execute("INSERT INTO targets VALUES(?,?)", ("doi:1", "capture:2"))
        db.execute("INSERT INTO blobs VALUES(?,?)", ("blob:empty", "e3b0"))
        for capture_id, captured_at in (("capture:1", "2026-08-24T01:00:00Z"), ("capture:2", "2026-08-24T01:01:00Z")):
            db.execute(
                "INSERT INTO captures VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                (capture_id, "doi:1", "blob:empty", captured_at, "https://doi.org/1", "https://example.test/1", 302,
                 json.dumps({"x-src-request-method": "HEAD"}), "[]", 0, "contextual"),
            )
        db.commit()
        db.close()
        observations, receipt = assays.capture_repetitions(root, "S1")
        self.assertEqual(len(observations), 1)
        self.assertEqual(observations[0]["classification"], "SAME_BYTES_REPEATED_OBSERVATION")
        self.assertFalse(observations[0]["source_mutation_established"])
        self.assertEqual(observations[0]["current_capture_id"], "capture:2")
        self.assertTrue(observations[0]["captures"][1]["is_current_target_pointer"])
        self.assertEqual(receipt["status"], "RECOVERED_WITHOUT_EVENT_DELETION")


if __name__ == "__main__":
    unittest.main()

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("phase2-bibliographic-target-successor.py")
SPEC = importlib.util.spec_from_file_location("phase2_bibliographic_target_successor", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


def write_jsonl(path: Path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row) + "\n" for row in records), encoding="utf-8")


class BibliographicTargetSuccessorTests(unittest.TestCase):
    def make_root(self):
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        write_json(root / "04-RECEIPTS/phase2/current-seal.json", {
            "atelier_snapshot_id": "S1",
            "seal_id": "seal:1",
        })
        return temporary, root

    def seed_reference(self, root: Path, doi: str, assertion_id: str = "r:1"):
        write_jsonl(root / "05-OPERATIONS/phase2/reference-assertions.jsonl", [{
            "reference_assertion_id": assertion_id,
            "source_derivative_id": "d:1",
            "source_capture_id": "c:1",
            "source_span": {"paragraph": 1},
            "cited_doi_raw": doi,
            "source_bibliography_graph_status": "WITNESSED_LITERAL_DOI",
            "semantic_body_graph_status": "UNRESOLVED",
            "archive_reconstructed_graph_status": "UNRESOLVED",
        }])

    def test_unique_exact_doi_resolves_one_local_manifestation(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl", [{
            "source_record_id": "18382146",
            "doi": "10.5281/zenodo.18382146",
        }])
        self.seed_reference(root, "https://doi.org/10.5281/zenodo.18382146")
        result = module.resolve_targets(root)
        self.assertEqual(result[0]["local_target_resolution_status"], "UNIQUE_LOCAL_TARGET")
        self.assertEqual(result[0]["local_target_entity_ids"], ["zenodo:18382146"])

    def test_duplicate_exact_doi_remains_ambiguous(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl", [
            {"source_record_id": "1", "doi": "10.1234/example"},
            {"source_record_id": "2", "doi": "10.1234/example"},
        ])
        self.seed_reference(root, "doi:10.1234/example")
        result = module.resolve_targets(root)[0]
        self.assertEqual(result["local_target_resolution_status"], "AMBIGUOUS_LOCAL_TARGET")
        self.assertEqual(result["local_target_entity_ids"], ["zenodo:1", "zenodo:2"])

    def test_unknown_doi_stays_unresolved(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl", [])
        self.seed_reference(root, "10.1234/missing")
        result = module.resolve_targets(root)[0]
        self.assertEqual(result["local_target_resolution_status"], "NO_LOCAL_TARGET")
        self.assertEqual(result["local_target_entity_ids"], [])

    def test_target_resolution_never_promotes_semantics(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl", [{
            "source_record_id": "18364461",
            "doi": "10.5281/zenodo.18364461",
        }])
        self.seed_reference(root, "10.5281/zenodo.18364461")
        result = module.resolve_targets(root)[0]
        self.assertEqual(result["semantic_body_graph_status"], "UNRESOLVED")
        self.assertEqual(result["archive_reconstructed_graph_status"], "UNRESOLVED")
        self.assertFalse(result["semantic_promotion_applied"])
        self.assertFalse(result["repair_applied_to_sealed_v1"])

    def test_incoming_query_returns_only_exact_target_neighbors(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        write_jsonl(root / "01-MANIFESTS/candidate-corpus.jsonl", [
            {"source_record_id": "18382146", "doi": "10.5281/zenodo.18382146"},
            {"source_record_id": "18364461", "doi": "10.5281/zenodo.18364461"},
        ])
        write_jsonl(root / "05-OPERATIONS/phase2/reference-assertions.jsonl", [
            {
                "reference_assertion_id": "r:origin",
                "source_derivative_id": "d:origin-citer",
                "source_capture_id": "c:1",
                "source_span": {"paragraph": 1},
                "cited_doi_raw": "10.5281/zenodo.18382146",
                "source_bibliography_graph_status": "WITNESSED_LITERAL_DOI",
                "semantic_body_graph_status": "UNRESOLVED",
                "archive_reconstructed_graph_status": "UNRESOLVED",
            },
            {
                "reference_assertion_id": "r:csr",
                "source_derivative_id": "d:csr-citer",
                "source_capture_id": "c:2",
                "source_span": {"paragraph": 2},
                "cited_doi_raw": "10.5281/zenodo.18364461",
                "source_bibliography_graph_status": "WITNESSED_LITERAL_DOI",
                "semantic_body_graph_status": "UNRESOLVED",
                "archive_reconstructed_graph_status": "UNRESOLVED",
            },
        ])
        resolved = module.resolve_targets(root)
        result = module.incoming(resolved, "zenodo:18382146")
        self.assertEqual([row["source_derivative_id"] for row in result], ["d:origin-citer"])

    def test_successor_refuses_sealed_output_directory(self):
        temporary, root = self.make_root()
        self.addCleanup(temporary.cleanup)
        forbidden = root / "05-OPERATIONS/phase2"
        forbidden.mkdir(parents=True, exist_ok=True)
        with self.assertRaises(SystemExit):
            module.safe_output_dir(root, forbidden)


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("srcctl.py")
SPEC = importlib.util.spec_from_file_location("srcctl", MODULE_PATH)
srcctl = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules["srcctl"] = srcctl
SPEC.loader.exec_module(srcctl)


def put(path: Path, text: str = "") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def empty_root(root: Path) -> None:
    put(root / "01-MANIFESTS" / "candidate-corpus.jsonl")
    for platform in ("academia", "substack", "medium"):
        put(root / "01-MANIFESTS" / "platforms" / f"{platform}.jsonl")


class SrcCtlTests(unittest.TestCase):
    def test_dry_run_plan_writes_nothing(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); empty_root(root)
            before = sorted(p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file())
            result = srcctl.command_plan(argparse.Namespace(root=root, dry_run=True))
            after = sorted(p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file())
            self.assertEqual(0, result)
            self.assertEqual(before, after)
            self.assertFalse((root / "07-ARCHIVE-LEDGER").exists())

    def test_same_name_changed_bytes_are_distinct_blobs_and_captures(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); empty_root(root); state = srcctl.State(root)
            state.db.execute(
                "INSERT INTO targets(target_id,platform,source_id,url,title,media_kind,rights_state,rights_evidence_json,state,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                ("t:1", "zenodo", "1", "https://example.invalid/a", "same.docx", "docx", "PUBLIC_ALLOWED", "{}", "PLANNED", srcctl.utc_now()),
            )
            state.db.commit()
            row = state.db.execute("SELECT * FROM targets WHERE target_id='t:1'").fetchone()
            c1, h1 = srcctl.promote_capture(state, row, 200, row["url"], {}, [], [], b"first")
            state.db.execute("UPDATE targets SET state='PLANNED' WHERE target_id='t:1'"); state.db.commit()
            row = state.db.execute("SELECT * FROM targets WHERE target_id='t:1'").fetchone()
            c2, h2 = srcctl.promote_capture(state, row, 200, row["url"], {}, [], [], b"second")
            self.assertNotEqual(h1, h2)
            self.assertNotEqual(c1, c2)
            self.assertEqual(2, state.db.execute("SELECT count(*) FROM captures").fetchone()[0])
            state.db.close()

    def test_interrupted_states_become_typed_retryable_failures(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); empty_root(root); state = srcctl.State(root)
            for index, status in enumerate(("FETCHING", "STAGED", "BLOB_COMMITTED"), 1):
                state.db.execute(
                    "INSERT INTO targets(target_id,platform,source_id,url,title,media_kind,rights_state,rights_evidence_json,state,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                    (f"t:{index}", "zenodo", str(index), "https://example.invalid", "x", "pdf", "PUBLIC_ALLOWED", "{}", status, srcctl.utc_now()),
                )
            state.db.commit()
            recovered = state.recover_incomplete()
            self.assertEqual(3, sum(recovered.values()))
            self.assertEqual({"RETRYABLE_FAILURE"}, {r[0] for r in state.db.execute("SELECT state FROM targets")})
            state.db.close()

    def test_http_failures_are_typed_without_suppression_inference(self):
        self.assertEqual("RATE_LIMITED", srcctl.classify_http_error(429))
        self.assertEqual("AUTH_REQUIRED", srcctl.classify_http_error(403))
        self.assertEqual("UNAVAILABLE", srcctl.classify_http_error(404))
        self.assertNotIn("SUPPRESSED", {srcctl.classify_http_error(x) for x in (401, 403, 404, 410, 429, 503)})

    def test_source_checksum_fixture(self):
        body = b"receipt"
        spec = "sha256:" + hashlib.sha256(body).hexdigest()
        self.assertTrue(srcctl.checksum_matches(spec, body))
        self.assertFalse(srcctl.checksum_matches(spec, body + b"x"))

    def test_opaque_private_locator_is_stable_and_nonpath(self):
        value = srcctl.stable_id("src-private-locator", "t:1", "capture:1")
        self.assertRegex(value, r"^src-private-locator:[a-f0-9]{24}$")
        self.assertNotIn("\\", value)
        self.assertNotIn("/", value)

    def test_tarjan_does_not_mix_predicates_for_caller(self):
        result = srcctl.tarjan({"a", "b", "c"}, [("a", "b"), ("b", "c")])
        self.assertTrue(all(len(component) == 1 for component in result))
        cyc = srcctl.tarjan({"a", "b"}, [("a", "b"), ("b", "a")])
        self.assertIn(["a", "b"], cyc)


if __name__ == "__main__":
    unittest.main()

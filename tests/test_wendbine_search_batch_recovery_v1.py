"""Source-free tests for recovery from already-observed archive responses."""
import datetime as dt
import importlib.util
import json
import tempfile
import unittest
import urllib.parse
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("recovery", ROOT / "scripts" / "wendbine-search-batch-recovery-v1.py")
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


class SearchRecovery(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.manifest = self.root / "manifest.jsonl"
        raw = r.h.encoded({"schema": "wendbine-manifestation/v1", "platform_account": r.h.AUTHOR,
            "subreddit": r.h.COMMUNITY, "source_id": "reddit:t3_abcde1"}) + b"\n"
        self.manifest.write_bytes(raw)
        p = patch.multiple(r.h, MANIFEST_SHA=r.h.sha(raw), SOURCE_COUNT=1)
        p.start()
        self.addCleanup(p.stop)
        self.responses = self.root / "responses"
        self.responses.mkdir()
        self.out = self.root / "captures.jsonl"

    def write_response(self, rows, observed="2026-11-04T16:00:00Z", lo=1767225600, hi=1793923200):
        url = r.d.SEARCH_URL + "?" + urllib.parse.urlencode({"author": r.h.AUTHOR, "subreddit": r.h.COMMUNITY,
            "after": r.d.stamp(lo - 1), "before": r.d.stamp(hi), "sort": "asc", "limit": r.d.LIMIT})
        key = r.h.sha(url.encode())
        raw = r.h.encoded({"data": rows})
        (self.responses / (key + ".json")).write_bytes(raw)
        receipt = {"request_sha256": key, "response_sha256": r.h.sha(raw), "window": [lo, hi],
            "observed_utc": observed, "returned_count": len(rows), "uri": url}
        (self.responses / (key + ".receipt.json")).write_bytes(r.h.encoded(receipt))
        return key

    def post(self, text):
        return {"id": "abcde1", "author": r.h.AUTHOR, "subreddit": r.h.COMMUNITY,
            "created_utc": 1790000000, "title": "Observed 𝌋", "selftext": text,
            "is_self": True, "is_video": False, "removed_by_category": "moderator"}

    def test_observed_text_and_provenance_survive_filtered_state(self):
        key = self.write_response([self.post("Observed historical body")])
        result = r.recover(self.manifest, self.responses, self.out)
        row = json.loads(self.out.read_text(encoding="utf8"))
        self.assertEqual(result["pinned_sources_observed"], 1)
        self.assertEqual(result["full_body_versions"], 1)
        self.assertEqual(row["selftext"], "Observed historical body")
        self.assertEqual(row["later_visibility_state"], "LATER_STATUS_UNKNOWN")
        self.assertEqual(row["source_archive_response_sha256"], r.h.sha((self.responses / (key + ".json")).read_bytes()))
        self.assertFalse(result["complete_discovery_claim"])
        with self.assertRaisesRegex(ValueError, "CAPTURE_OUTPUT_ALREADY_EXISTS"):
            r.recover(self.manifest, self.responses, self.out)

    def test_tampered_response_fails_before_output(self):
        key = self.write_response([self.post("text")])
        (self.responses / (key + ".json")).write_bytes(b"{}")
        with self.assertRaisesRegex(ValueError, "SEARCH_RESPONSE_HASH_MISMATCH"):
            r.recover(self.manifest, self.responses, self.out)
        self.assertFalse(self.out.exists())

    def test_placeholder_retains_title_without_invented_body(self):
        self.write_response([self.post("[removed]")])
        result = r.recover(self.manifest, self.responses, self.out)
        row = json.loads(self.out.read_text(encoding="utf8"))
        self.assertEqual(row["selftext"], "")
        self.assertEqual(result["title_only_versions"], 1)

    def test_distinct_observed_versions_remain_separate(self):
        self.write_response([self.post("First observed body")])
        self.write_response([self.post("Later observed body")], observed="2026-11-04T16:01:00Z", lo=1767225601)
        result = r.recover(self.manifest, self.responses, self.out)
        rows = [json.loads(line) for line in self.out.read_text(encoding="utf8").splitlines()]
        self.assertEqual(result["unique_sources"], 1)
        self.assertEqual(result["capture_versions"], 2)
        self.assertEqual({row["selftext"] for row in rows}, {"First observed body", "Later observed body"})
        self.assertEqual(len({row["capture_id"] for row in rows}), 2)


if __name__ == "__main__":
    unittest.main()

"""Adversarial source-free tests. All post text is deliberately invented."""
import hashlib
from contextlib import closing
import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("local_capture",ROOT/"scripts"/"wendbine-local-capture-intake-v1.py")
m=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)

def sha(s):
    return hashlib.sha256(s.encode("utf8")).hexdigest()

def row(cid,sid,body,captured="2026-09-12T12:00:00Z",state="LATER_STATUS_UNKNOWN",title="Test 𝌋",author="Upset-Ratio502"):
    return {
      "schema":"td613.wendbine.local-capture/v1",
      "capture_id":cid,"source_id":sid,"author":author,"subreddit":"Wendbine",
      "source_system":"OPERATOR_CONTROLLED_SYNTHETIC_TEST","source_locator":"local://invented-fixture",
      "published_at_utc":"2026-09-11T11:00:00Z","captured_at_utc":captured,
      "later_visibility_state":state,"title":title,"selftext":body,
      "title_sha256":sha(title),"body_sha256":sha(body),
      "is_self":True,"is_video":False
    }

class HistoricalCustody(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root=Path(self.tmp.name)
        self.manifest=root/"synthetic-capture.jsonl"
        self.db=root/"local.sqlite"
        self.start="2026-09-01T00:00:00Z"
        self.end="2026-10-01T00:00:00Z"

    def write(self,records):
        self.manifest.write_text("\n".join(json.dumps(r,ensure_ascii=False) for r in records)+"\n","utf8")

    def ingest(self):
        return m.import_local(self.manifest,self.db,self.start,self.end,"OPERATOR_TEST_DECLARATION_NOT_OWNERSHIP")

    def test_historical_text_survives_reported_filter_and_later_version(self):
        original=row("c1","reddit:t3_abcde1","Original 𝌋 from September")
        newer=row("c2","reddit:t3_abcde1","Edited later capture, not replacement",
                  "2026-09-14T12:00:00Z","PLATFORM_FILTERED_REPORTED")
        other=row("c3","reddit:t3_abcde2","Another full historical observed body",
                  "2026-09-16T12:00:00Z","AUTHOR_DELETED_REPORTED")
        self.write([newer,other,original])
        with patch.object(m.INDEX,"_http_fetch",side_effect=AssertionError("NETWORK_CALL_FORBIDDEN")):
            report=self.ingest()
        self.assertEqual(report["unique_sources"],2)
        self.assertEqual(report["capture_versions"],3)
        self.assertEqual(report["primary_bodies"],2)
        self.assertEqual(report["fts_rows"],2)
        self.assertEqual(report["reported_visibility_counts"]["PLATFORM_FILTERED_REPORTED"],1)
        self.assertFalse(report["current_platform_status_verified"])
        self.assertFalse(report["encrypted_archives_read"])
        with closing(sqlite3.connect(self.db)) as verify:
            original_hit=m.INDEX.exact_search(verify,"Original 𝌋")
        self.assertEqual(len(original_hit),1)
        self.assertEqual(original_hit[0]["byte_offset"],0)
        lexical=m.history_lexical(self.db,"Edited",limit=10)
        self.assertEqual(len(lexical),1)
        self.assertEqual(lexical[0]["capture_id"],"c2")
        self.assertEqual(lexical[0]["later_visibility_state"],"PLATFORM_FILTERED_REPORTED")
        self.assertEqual(report["all_capture_fts_rows"],3)
        edited=m.history_exact(self.db,"Edited later capture")
        self.assertEqual(len(edited),1)
        self.assertEqual(edited[0]["capture_id"],"c2")
        self.assertEqual(edited[0]["later_visibility_state"],"PLATFORM_FILTERED_REPORTED")
        with closing(sqlite3.connect(self.db)) as con:
            self.assertEqual(con.execute("SELECT count(*) FROM capture_versions").fetchone()[0],3)
            self.assertEqual(con.execute("SELECT count(*) FROM sources").fetchone()[0],2)
            provider=con.execute("SELECT distinct provider FROM sources").fetchone()[0]
            self.assertEqual(provider,"OPERATOR_LOCAL_CAPTURE")
            primary=con.execute("SELECT selftext FROM sources WHERE source_id='reddit:t3_abcde1'").fetchone()[0]
            self.assertEqual(primary,"Original 𝌋 from September".encode("utf8"))

    def test_refuses_wrong_source_hash_and_duplicate_capture_id(self):
        a=row("c1","reddit:t3_abcde1","Unchanged text")
        b=dict(a);b["body_sha256"]="0"*64
        self.write([b])
        with self.assertRaisesRegex(ValueError,"CAPTURE_HASH_MISMATCH"):self.ingest()
        self.assertFalse(self.db.exists())
        self.write([a,a])
        with self.assertRaisesRegex(ValueError,"DUPLICATE_CAPTURE_ID"):self.ingest()
        self.assertFalse(self.db.exists())

    def test_removed_placeholder_and_unsupported_state_are_refused(self):
        x=row("c1","reddit:t3_abcde1","[removed]")
        self.write([x])
        with self.assertRaisesRegex(ValueError,"PLACEHOLDER_IS_NOT_PRESERVED_TEXT"):self.ingest()
        x=row("c1","reddit:t3_abcde1","Verifiable captured text",state="AUTHOR_MALICE_PROVEN")
        self.write([x])
        with self.assertRaisesRegex(ValueError,"CAPTURE_STATE_UNREGISTERED"):self.ingest()

    def test_custody_source_mismatch_and_publication_period_hold(self):
        x=row("c1","reddit:t3_abcde1","Captured 𝌋 source",author="DifferentAuthor")
        self.write([x])
        with self.assertRaisesRegex(ValueError,"CAPTURE_AUTHOR_OR_COMMUNITY_MISMATCH"):self.ingest()
        x=row("c1","reddit:t3_abcde1","Captured 𝌋 source")
        x["published_at_utc"]="2025-09-11T11:00:00Z"
        self.write([x])
        with self.assertRaisesRegex(ValueError,"CAPTURE_OUTSIDE_DECLARED_RANGE"):self.ingest()

    def test_no_encrypted_zip_or_invented_empty_research(self):
        self.manifest.with_suffix(".zip").write_bytes(b"NOT_ACTUAL_ZIP")
        with self.assertRaisesRegex(ValueError,"JSONL_CAPTURE_ONLY_NO_ENCRYPTED_ARCHIVE"):
            m.read_manifest(self.manifest.with_suffix(".zip"))
        self.write([])
        with self.assertRaisesRegex(ValueError,"EMPTY_CAPTURE_MANIFEST"):self.ingest()

    def test_duplicate_json_keys_fail_closed(self):
        raw=b'{"schema":"td613.wendbine.local-capture/v1","schema":"evil"}'
        with self.assertRaisesRegex(ValueError,"DUPLICATE_CAPTURE_JSON_KEY"):
            m.parse_capture(raw,1)

    def test_conflicting_publication_times_same_source_are_held_before_database_creation(self):
        first=row("c1","reddit:t3_abcde1","First observation")
        second=row("c2","reddit:t3_abcde1","Second observation","2026-09-14T12:00:00Z")
        second["published_at_utc"]="2026-09-12T11:00:00Z"
        self.write([first,second])
        with self.assertRaisesRegex(ValueError,"CONFLICTING_SOURCE_PUBLICATION_TIME"):
            self.ingest()
        self.assertFalse(self.db.exists())

    def test_history_search_detects_mutated_observed_version(self):
        self.write([row("c1","reddit:t3_abcde1","Unmodified observation")])
        self.ingest()
        with closing(sqlite3.connect(self.db)) as con:
            con.execute("UPDATE capture_versions SET selftext=? WHERE capture_id='c1'",(b"TAMPERED",))
            con.commit()
        with self.assertRaisesRegex(ValueError,"CAPTURE_VERSION_DIGEST_CONFLICT"):
            m.history_exact(self.db,"TAMPERED")

if __name__=="__main__":
    unittest.main()

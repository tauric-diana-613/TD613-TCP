"""Source-free tests of exact captured URL spans and failure behavior."""
import hashlib
import importlib.util
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("urlindex", ROOT / "scripts" / "wendbine-observed-url-index-v1.py")
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ObservedUrlIndex(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.db = Path(tmp.name) / "fixture.sqlite"
        title = "𝌋 A title".encode("utf8")
        body = "𝌋 before https://example.test/path after".encode("utf8")
        with closing(sqlite3.connect(self.db)) as con:
            con.execute("create table capture_versions(capture_id text primary key,source_id text,title blob,selftext blob,title_sha256 text,body_sha256 text)")
            con.execute("insert into capture_versions values(?,?,?,?,?,?)", ("fixture-capture", "fixture-source", title, body,
                hashlib.sha256(title).hexdigest(), hashlib.sha256(body).hexdigest()))
            con.commit()
        self.body = body

    def test_exact_utf8_offset_and_no_overwrite(self):
        self.assertEqual(m.index_urls(self.db)["url_spans"], 1)
        with closing(sqlite3.connect(self.db)) as con:
            offset, size, span, relation, evidence = con.execute(
                "select byte_offset,length_utf8,observed_span,relation,evidence_class from observed_url_spans").fetchone()
        self.assertEqual(self.body[offset:offset + size], span.encode("utf8"))
        self.assertEqual(relation, "EXPLICIT_URL_SPAN")
        self.assertEqual(evidence, "OBSERVED_CAPTURE_NOT_SEMANTIC_RELATION")
        with self.assertRaisesRegex(ValueError, "URL_INDEX_ALREADY_EXISTS"):
            m.index_urls(self.db)

    def test_tamper_rolls_back_entire_index(self):
        with closing(sqlite3.connect(self.db)) as con:
            con.execute("update capture_versions set body_sha256=?", ("0" * 64,))
            con.commit()
        with self.assertRaisesRegex(ValueError, "CAPTURE_VERSION_DIGEST_CONFLICT"):
            m.index_urls(self.db)
        with closing(sqlite3.connect(self.db)) as con:
            self.assertIsNone(con.execute("select 1 from sqlite_master where name='observed_url_spans'").fetchone())


if __name__ == "__main__":
    unittest.main()

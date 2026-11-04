import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def module(filename,label):
    spec=importlib.util.spec_from_file_location(label,ROOT/"scripts"/filename)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
index=module("wendbine-live-research-index-v1.py","wendbine_index")
check=module("wendbine-source-coverage-adjudicator-v1.py","wendbine_reconciler")

class Coverage(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.path=self.root/"db.sqlite"
        db=index.prepare_db(self.path)
        try:
            index.import_rows(db,[{"id":"abcde1","author":"Upset-Ratio502","subreddit":"Wendbine",
             "title":"test","selftext":"𝌋 original observed text","created_utc":1790000000}],
             "2026-09-11T00:00:00Z","2026-11-05T00:00:00Z","2026-11-04T02:48:02Z")
        finally:db.close()
        self.manifest=self.root/"manifestations.jsonl"
        self.entries=[{"source_id":"reddit:t3_abcde1","published_at":"2026-09-21T17:06:40Z"}]
        self.write()

    def write(self):
        self.manifest.write_text("\n".join(json.dumps(x) for x in self.entries)+"\n",encoding="utf8")

    def run_check(self):
        return check.reconcile(self.path,self.manifest,"2026-09-11T00:00:00Z","2026-11-05T00:00:00Z")

    def test_completed_verified_original_id(self):
        # Put the real timestamp in the checked window; no need to match
        # manifest publication to the opaque ID for a corpus-set comparison.
        r=self.run_check()
        self.assertTrue(r["source_body_coverage_complete_against_public_registry"])
        self.assertEqual(r["shared_ids"],1)
        self.assertEqual(r["missing_public_ids"],[])

    def test_missing_source_is_a_visible_hold_not_a_reconstructed_record(self):
        self.entries.append({"source_id":"reddit:t3_abcde2","published_at":"2026-09-22T00:00:00Z"})
        self.write()
        r=self.run_check()
        self.assertFalse(r["source_body_coverage_complete_against_public_registry"])
        self.assertEqual(r["missing_public_ids"],["reddit:t3_abcde2"])
        self.assertEqual(r["removed_unavailable_originals_reconstructed"],0)

    def test_duplicate_public_id_refused(self):
        self.entries.append(dict(self.entries[0]));self.write()
        with self.assertRaisesRegex(ValueError,"PUBLIC_MANIFEST_DUPLICATE_SOURCE"):
            self.run_check()

if __name__=="__main__":unittest.main()

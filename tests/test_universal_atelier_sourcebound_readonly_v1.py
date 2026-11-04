import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(p,name):
    spec=importlib.util.spec_from_file_location(name,ROOT/"scripts"/p)
    obj=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(obj)
    return obj
w=load("wendbine-live-research-index-v1.py","wendbine_source")
u=load("universal-atelier-sourcebound-readonly-v1.py","universal_source")

class UniversalSourceBoundTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base=Path(self.tmp.name)
        self.repo=self.base/"repo"
        for estate in ("SRC","EMSTD613"):
            folder=self.repo/u.BASE/estate/"03-DERIVATIVES"/"text"
            folder.mkdir(parents=True)
            (folder/"one.txt").write_text(f"{estate} concept 𝌋 demonstrative DERIVATIVE bytes",encoding="utf8")
        self.dbpath=self.base/"wendbine.sqlite"
        db=w.prepare_db(self.dbpath)
        try:
            row={"id":"abcde1","author":"Upset-Ratio502","subreddit":"Wendbine",
              "created_utc":1790000000,"title":"original link","selftext":"𝌋 Paul's observed text with original UTF-8."}
            w.import_rows(db,[row],"2026-09-11T09:50:25Z","2026-11-05T00:00:00Z","2026-11-04T02:48:02Z")
        finally:db.close()

    def test_federated_exact_text_never_promotes_src_em_derivatives_to_originals(self):
        hit=u.exact_query(u.load_sources(self.dbpath,self.repo),"𝌋",limit=20)
        self.assertEqual(len(hit),3)
        kinds={x["estate"]:x["source_kind"] for x in hit}
        self.assertEqual(kinds["WENDBINE"],"OBSERVED_PUBLIC_PROVIDER_TEXT_NOT_AUTHOR_SIGNED")
        self.assertEqual(kinds["SRC"],"NATIVE_RESEARCH_DERIVATIVE_UNVERIFIED_ORIGINAL")
        self.assertEqual(kinds["EMSTD613"],"NATIVE_RESEARCH_DERIVATIVE_UNVERIFIED_ORIGINAL")
        self.assertTrue(next(x for x in hit if x["estate"]=="WENDBINE")["original_source_bytes_verified"])
        self.assertFalse(next(x for x in hit if x["estate"]=="EMSTD613")["original_source_bytes_verified"])
        audit=u.state(u.load_sources(self.dbpath,self.repo))
        self.assertEqual(audit["estates"]["WENDBINE"]["original_observed"],1)
        self.assertEqual(audit["estates"]["SRC"]["native_derivatives"],1)
        self.assertEqual(audit["estates"]["EMSTD613"]["native_derivatives"],1)
        self.assertEqual(audit["Wendbine_semantic_embedding_parity"],"UNVERIFIED")

    def test_original_wendbine_title_search_preserves_field_and_digest(self):
        import hashlib
        rows=u.exact_query(u.load_sources(self.dbpath,self.repo),"original link",limit=20)
        self.assertEqual(len(rows),1)
        hit=rows[0]
        self.assertEqual(hit["estate"],"WENDBINE")
        self.assertEqual(hit["source_id"],"reddit:t3_abcde1")
        self.assertEqual(hit["source_field"],"title")
        self.assertEqual(hit["byte_offset"],0)
        self.assertEqual(hit["source_sha256"],hashlib.sha256(b"original link").hexdigest())
        self.assertTrue(hit["original_source_bytes_verified"])
        body=u.exact_query(u.load_sources(self.dbpath,self.repo),"Paul's observed",limit=20)
        self.assertEqual(len(body),1)
        self.assertEqual(body[0]["source_field"],"selftext")
        self.assertEqual(body[0]["source_sha256"],
            hashlib.sha256(b"\xf0\x9d\x8c\x8b Paul's observed text with original UTF-8.").hexdigest())

    def test_balanced_all_estates_and_explicit_estate_scoping(self):
        # A common token must not allow source enumeration order to starve
        # Wendbine before its source-backed bytes are ever read.
        hits=u.exact_query(u.load_sources(self.dbpath,self.repo),"𝌋",limit=3)
        self.assertEqual([h["estate"] for h in hits],
                         ["WENDBINE","SRC","EMSTD613"])
        partial=u.exact_query(u.load_sources(self.dbpath,self.repo),"𝌋",limit=2)
        self.assertEqual([h["estate"] for h in partial],["WENDBINE","SRC"])
        em=u.exact_query(u.load_sources(self.dbpath,self.repo),"𝌋",
                         limit=1,estate="EMSTD613")
        self.assertEqual(len(em),1)
        self.assertEqual(em[0]["estate"],"EMSTD613")
        original=u.exact_query(u.load_sources(self.dbpath,self.repo),
                               "Paul's observed",limit=1,estate="WENDBINE")
        self.assertEqual(original[0]["source_field"],"selftext")
        self.assertRaisesRegex(ValueError,"UNREGISTERED_QUERY_ESTATE",
                               u.exact_query,[],"𝌋",1,"BAD")

    def test_wrong_source_local_file_or_path_refused(self):
        self.assertRaisesRegex(ValueError,"OPERATOR_LOCAL_WENDBINE_DB_REQUIRED",
          lambda:list(u.load_sources(Path("/nothing/to/read/wendbine.sqlite"),self.repo)))
        file=self.repo/u.BASE/"SRC"/"03-DERIVATIVES"/"text"/"one.txt"
        file.unlink()
        file.symlink_to(self.dbpath)
        self.assertRaisesRegex(ValueError,"NATIVE_DERIVATIVE_INVALID",
          lambda:list(u.load_sources(self.dbpath,self.repo)))

    def test_source_exposure_limits_and_byte_offsets(self):
        hit=u.exact_query(u.load_sources(self.dbpath,self.repo),"𝌋 Paul's",limit=10)
        self.assertEqual(len(hit),1)
        self.assertEqual(hit[0]["byte_offset"],0)
        self.assertEqual(hit[0]["source_id"],"reddit:t3_abcde1")
        self.assertRaises(ValueError,u.exact_query,[], "", 10)


    def test_both_native_checkouts_are_required_and_pinned(self):
        import types
        from unittest.mock import patch
        srcroot=self.base/"src-worktree"
        emroot=self.base/"em-worktree"
        for base,estate in ((srcroot,"SRC"),(emroot,"EMSTD613")):
            (base/u.BASE/estate).mkdir(parents=True)
        with self.assertRaisesRegex(ValueError,"BOTH_NATIVE_CHECKOUTS_REQUIRED"):
            list(u.load_sources(self.dbpath,self.repo,native_checkouts={"SRC":srcroot}))
        with patch.object(u.subprocess,"run",return_value=types.SimpleNamespace(stdout="0"*40)) as proc:
            with self.assertRaisesRegex(ValueError,"NATIVE_CHECKOUT_HEAD_DRIFT"):
                u.verify_native_checkout(srcroot,"SRC")
            self.assertTrue(proc.called)
        with patch.object(u.subprocess,"run",side_effect=[
                types.SimpleNamespace(stdout=u.NATIVE_PINNED_HEADS["SRC"]),
                types.SimpleNamespace(stdout=u.NATIVE_PINNED_HEADS["EMSTD613"])]):
            self.assertEqual(u.verify_native_checkout(srcroot,"SRC"),srcroot/u.BASE/"SRC")
            self.assertEqual(u.verify_native_checkout(emroot,"EMSTD613"),emroot/u.BASE/"EMSTD613")

if __name__=="__main__":unittest.main()

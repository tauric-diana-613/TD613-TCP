import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/"scripts/wendbine-live-research-index-v1.py"
spec=importlib.util.spec_from_file_location("td613_wendbine_index",MODULE)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def post(pid,created=1790000000,title="Topology 𝌋",text="SOURCE point ↔ loop, see https://www.reddit.com/r/Wendbine/comments/abcde5/related/"):
    return {"id":pid,"author":"Upset-Ratio502","subreddit":"Wendbine",
      "created_utc":created,"title":title,"selftext":text,"is_self":True}

class AtelierOriginalRetrieval(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.dbpath=Path(self.tmp.name)/"wendbine.sqlite"
        self.db=m.prepare_db(self.dbpath)
        self.addCleanup(self.db.close)
        self.start="2026-09-11T09:50:25Z"
        self.end="2026-11-05T00:00:00Z"

    def ingest(self,rows):
        return m.import_rows(self.db,rows,self.start,self.end,"2026-11-04T02:48:02Z")

    def test_source_text_bytes_fts_exact_unicode_and_graph_evidence(self):
        txt="Paul states: 𝌋 topology → relations. See https://www.reddit.com/r/Wendbine/comments/abcde5/related/"
        result=self.ingest([post("abcde1",text=txt),post("abcde5",text="related term"),post("abcde2",text="")])
        self.assertEqual(result["unique_sources"],3)
        self.assertEqual(result["nonempty_bodies"],2)
        self.assertEqual(result["empty_bodies"],1)
        src=self.db.execute("select selftext,body_sha256,body_bytes from sources where source_id='reddit:t3_abcde1'").fetchone()
        self.assertEqual(src[0],txt.encode("utf8"))
        self.assertEqual(src[1],m.sha(txt.encode("utf8")))
        self.assertEqual(src[2],len(txt.encode("utf8")))
        hits=m.exact_search(self.db,"𝌋 topology")
        self.assertEqual(len(hits),1)
        self.assertEqual(hits[0]["byte_offset"],len("Paul states: ".encode("utf8")))
        self.assertEqual(hits[0]["observed_quote"],"𝌋 topology")
        fts=m.fts_search(self.db,"relations topology")
        self.assertTrue(any(x["source_id"]=="reddit:t3_abcde1" for x in fts))
        graph=list(self.db.execute("select src,dst,relation,offset_utf8,evidence_span from links"))
        self.assertEqual(len(graph),1)
        self.assertEqual(graph[0][0],"reddit:t3_abcde1")
        self.assertEqual(graph[0][1],"reddit:t3_abcde5")
        self.assertEqual(graph[0][3],len(txt[:txt.index("https://")].encode("utf8")))
        self.assertEqual(m.status(self.db)["vector_semantic_state"],"NOT_AVAILABLE")

    def test_deleted_posts_are_excluded_and_not_searchable(self):
        a=post("abcde1",text="[removed]")
        b=post("abcde2",text="private deleted",title="removed")
        b["removed_by_category"]="moderator"
        report=self.ingest([a,b,post("abcde3",text="valid")])
        self.assertEqual(report["unique_sources"],1)
        self.assertEqual(report["removed_or_invalid_held"],2)
        self.assertEqual(m.status(self.db)["sources"],1)
        self.assertEqual(m.exact_search(self.db,"deleted"),[])

    def test_requires_explicit_rights_for_live_sync_and_refuses_overwrite(self):
        from argparse import Namespace
        self.assertRaises(FileExistsError,m.prepare_db,self.dbpath)
        self.assertEqual(m.status(self.db)["sources"],0)
        self.assertRaises(ValueError,m.fetch_history,self.start,self.end,0,100)

    def test_duplicate_conflicting_post_versions_fail_closed(self):
        rows=[post("abcde1",text="first"),post("abcde1",text="second")]
        self.assertRaisesRegex(ValueError,"SAME_BATCH_SOURCE_ID_DIFFERENT_BODY_HELD",self.ingest,rows)

    def test_sort_invalid_provider_response_and_bounded_nonprogress(self):
        def reversed_page(_):
            data=[post("abcde1",created=1790000001),post("abcde2",created=1790000000)]
            return json.dumps({"data":data}).encode("utf8")
        with self.assertRaisesRegex(ValueError,"PROVIDER_SORT_ASC_MISMATCH"):
            m.fetch_history(self.start,self.end,1,100,reversed_page)
        def stale(_):
            data=[post("abcde1",created=1790000000)]
            return json.dumps({"data":data}).encode("utf8")
        with self.assertRaisesRegex(ValueError,"PROVIDER_MAX_PAGES_REACHED_NOT_COMPLETE|PROVIDER_PAGINATION_NO_PROGRESS"):
            m.fetch_history(self.start,self.end,1,1,stale)

    def test_source_historical_start_is_actual_verified_atelier_commit(self):
        self.assertEqual(m.ATELIER_START_UTC,"2026-09-11T09:50:25Z")
        self.assertLess(m.utc(m.DEFAULT_SINCE),m.utc(m.ATELIER_START_UTC))
        self.assertFalse(self.ingest([post("abcde1")])["archive_completeness_proven"])

    def test_explicit_edge_alone_never_claims_semantic_math_relation(self):
        self.ingest([post("abcde1",text="https://www.reddit.com/r/Wendbine/comments/abcde5/")])
        r=self.db.execute("select relation,evidence_class from links").fetchone()
        self.assertEqual(r[0],"EXPLICIT_WENDBINE_POST_LINK")
        self.assertEqual(r[1],"OBSERVED_TEXTUAL_LINK_NOT_DEPENDENCY_PROOF")
        self.assertEqual(m.status(self.db)["inference_graph_state"],"NOT_AVAILABLE")

if __name__=="__main__":
    unittest.main()

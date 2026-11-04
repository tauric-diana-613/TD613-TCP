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


    def test_full_utc_day_enumeration_including_linked_video_and_pagination(self):
        text="Refer to https://www.reddit.com/r/Wendbine/comments/abcde2/"
        video=post("abcde2",created=1790000001,title="Mysterious video",text="")
        video.update(is_self=False,is_video=True,url="https://www.youtube.com/watch?v=example")
        self.ingest([post("abcde1",created=1790000000,text=text),video])
        first=m.enumerate_day(self.db,"2026-09-21",limit=1)
        self.assertEqual(first["observed_total"],2)
        self.assertEqual(first["returned"],1)
        self.assertEqual(first["next_offset"],1)
        second=m.enumerate_day(self.db,"2026-09-21",limit=1,offset=1)
        self.assertIsNone(second["next_offset"])
        self.assertEqual(second["entries"][0]["media_kind"],"VIDEO")
        self.assertEqual(second["entries"][0]["external_media_url"],"https://www.youtube.com/watch?v=example")
        self.assertEqual(second["entries"][0]["body_state"],"EMPTY_MEDIA_LINK_POST")
        self.assertFalse(second["entries"][0]["media_transcript_observed"])
        self.assertEqual(m.enumerate_day(self.db,"2026-09-20")["observed_total"],0)
        self.assertRaises(ValueError,m.enumerate_day,self.db,"2026-02-30")

    def test_grounded_graph_traversal_preserves_exact_link_span_and_refuses_inference(self):
        self.ingest([post("abcde1",text="Follow https://www.reddit.com/r/Wendbine/comments/abcde2/"),
                     post("abcde2",text="Second actual text")])
        g=m.explicit_graph(self.db,"reddit:t3_abcde1",max_depth=2)
        self.assertEqual(g["indexed_nodes_reached"],2)
        self.assertEqual(len(g["edges"]),1)
        self.assertTrue(g["edges"][0]["target_indexed"])
        self.assertEqual(g["edges"][0]["evidence_utf8_byte_offset"],len("Follow ".encode("utf8")))
        self.assertEqual(g["mathematical_relational_geometry"],"NOT_ESTABLISHED")
        self.assertRaises(ValueError,m.explicit_graph,self.db,"reddit:t3_missing")


    def test_chronological_resume_reuses_real_database_and_never_overwrites_previous_bytes(self):
        import contextlib
        import io
        import sys
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as td:
            path=Path(td)/"real_history.sqlite"
            first=post("abcde1",created=1790000000,text="First persistent original")
            second=post("abcde2",created=1790086400,text="Later captured original")
            def execute(argv,rows):
                with patch.object(sys,"argv",["index","--db",str(path),*argv]):
                    with patch.object(m,"fetch_history",return_value=(rows,{"provider":"TEST_STUB"})) as fetch:
                        with contextlib.redirect_stdout(io.StringIO()):
                            m.main()
                        return fetch.call_args.args[0]
            old_end="2026-09-22T00:00:00Z"
            new_end="2026-09-24T00:00:00Z"
            initial=execute(["sync","--since","2026-01-01T00:00:00Z",
                "--until",old_end,"--operator-confirmed-rights"],[first])
            self.assertEqual(initial,"2026-01-01T00:00:00Z")
            resumed=execute(["sync","--until",new_end,"--resume",
                "--operator-confirmed-rights"],[second])
            self.assertEqual(resumed,"2026-09-20T00:00:00Z")
            with contextlib.closing(sqlite3.connect(path)) as con:
                self.assertEqual(m.status(con)["sources"],2)
                self.assertEqual(m.status(con)["last_successful_until_utc"],new_end)
                self.assertEqual(m.status(con)["index_source_class"],"ARCTIC_SHIFT")
                prior=con.execute("select selftext from sources where source_id='reddit:t3_abcde1'").fetchone()[0]
                self.assertEqual(prior,b"First persistent original")
            with self.assertRaisesRegex(ValueError,"VERSION_DRIFT_REQUIRES_EXPLICIT_ADJUDICATION"):
                execute(["sync","--until","2026-09-25T00:00:00Z","--resume",
                         "--operator-confirmed-rights"],[post("abcde2",created=1790086400,text="Silently changed!")])
            with contextlib.closing(sqlite3.connect(path)) as con:
                self.assertEqual(m.status(con)["last_successful_until_utc"],new_end)
                self.assertEqual(con.execute("select selftext from sources where source_id='reddit:t3_abcde1'").fetchone()[0],prior)

    def test_synthetic_fixture_watermark_cannot_be_resumed_as_genuine_source(self):
        self.db.execute("insert into audit(key,value) values('source_class','INVENTED_SYNTHETIC_FIXTURE')")
        self.db.execute("insert into audit(key,value) values('last_successful_until_utc','2026-09-22T00:00:00Z')")
        self.db.commit()
        import sys, contextlib, io
        from unittest.mock import patch
        with patch.object(sys,"argv",["index","--db",str(self.dbpath),"sync",
                    "--resume","--until","2026-11-05T00:00:00Z","--operator-confirmed-rights"]):
            with self.assertRaisesRegex(ValueError,"RESUME_SYNTHETIC_OR_UNATTESTED_DB_REFUSED"):
                with contextlib.redirect_stdout(io.StringIO()):m.main()

if __name__=="__main__":
    unittest.main()

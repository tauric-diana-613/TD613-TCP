"""Source-free adversarial ID hydration; all historical post text invented."""
import datetime as dt
import hashlib
import importlib.util
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
def load(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/"scripts"/file)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
h=load("td613_hydration","wendbine-manifest-id-hydrator-v1.py")
c=load("td613_local_capture_import","wendbine-local-capture-intake-v1.py")
u=load("td613_local_universal","universal-atelier-sourcebound-readonly-v1.py")
OBS=dt.datetime(2026,11,4,15,0,tzinfo=dt.timezone.utc)
PUB=int(dt.datetime(2026,9,10,0,0,tzinfo=dt.timezone.utc).timestamp())
IDS=["reddit:t3_abcde1","reddit:t3_abcde2","reddit:t3_abcde3","reddit:t3_abcde4"]

def p(id,text,*,author="Upset-Ratio502",removed=None):
    row={"id":id,"title":"Historical ∴ 𝌋","selftext":text,"author":author,
         "subreddit":"Wendbine","created_utc":PUB,
         "is_self":True,"is_video":False,
         "url":f"https://www.reddit.com/r/Wendbine/comments/{id}/"}
    if removed is not None:row["removed_by_category"]=removed
    return row

class KnownIdArchiveSourceFree(unittest.TestCase):
    def setUp(self):
        tmp=tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root=Path(tmp.name)
        self.manifest=root/"manifest.jsonl"
        raw=b"".join(h.encoded({
           "schema":"wendbine-manifestation/v1",
           "platform_account":"Upset-Ratio502","subreddit":"Wendbine",
           "source_id":sid,"published_at":"2026-09-10T00:00:00Z"
        })+b"\n" for sid in IDS)
        self.manifest.write_bytes(raw)
        self.private=root/"private"
        self.hash_patch=patch.multiple(h,MANIFEST_SHA=h.sha(raw),SOURCE_COUNT=len(IDS))
        self.hash_patch.start()
        self.addCleanup(self.hash_patch.stop)
        self.clock=lambda:OBS

    def fake(self,url):
        ids=url.split("ids=",1)[1].split("%2C")
        if ids[0]=="abcde1":
            return h.encoded({"data":[
                p("abcde1","Actually archived glyph 𝌋 after filtering",removed="moderator"),
                p("abcde2","[removed]")]})
        if ids[0]=="abcde3":
            return h.encoded([p("abcde3","Third public archive body")])
        raise AssertionError("UNEXPECTED_ID_REQUEST")

    def test_realistic_ID_hydration_and_local_ingest_integration(self):
        receipt=h.hydrate(self.manifest,self.private,batch_size=2,
          fetch=self.fake,clock=self.clock)
        self.assertEqual(receipt["manifest_ids"],4)
        self.assertEqual(receipt["observed_archive_text_sources"],3)
        self.assertEqual(receipt["body_available_sources"],2)
        self.assertEqual(receipt["title_only_sources"],1)
        self.assertEqual(receipt["held_by_reason"],{"NOT_RETURNED_BY_ARCHIVE_ID_LOOKUP":1})
        self.assertFalse(receipt["source_id_coverage_complete"])
        self.assertFalse(receipt["author_originals_cryptographically_attested"])
        self.assertFalse(receipt["ciphertext_archives_opened"])
        out=self.private/"wendbine-captures.jsonl"
        rows=[json.loads(x) for x in out.read_text("utf8").splitlines()]
        self.assertEqual(len(rows),3)
        first=next(x for x in rows if x["source_id"]=="reddit:t3_abcde1")
        self.assertEqual(first["selftext"],"Actually archived glyph 𝌋 after filtering")
        self.assertEqual(first["later_visibility_state"],"LATER_STATUS_UNKNOWN")
        self.assertEqual(first["source_archive_body_availability"],"FULL_OBSERVED_BODY")
        missing=next(x for x in rows if x["source_id"]=="reddit:t3_abcde2")
        self.assertEqual(missing["selftext"],"")
        self.assertEqual(missing["source_archive_body_availability"],
                          "REMOVAL_PLACEHOLDER_TITLE_ONLY")
        self.assertEqual(first["captured_at_utc"],"2026-11-04T15:00:00Z")
        db=self.private/"wendbine.sqlite"
        result=c.import_local(out,db,"2026-01-01T00:00:00Z",
           "2026-11-05T00:00:00Z","INVENTED_PROVIDER_TEST_NOT_REAL_SOURCE")
        self.assertEqual(result["unique_sources"],3)
        self.assertEqual(result["all_capture_fts_rows"],3)
        with closing(sqlite3.connect(db)) as con:
            rows=con.execute("SELECT provider,selftext FROM sources WHERE source_id=?",
                   ("reddit:t3_abcde1",)).fetchone()
            self.assertEqual(rows[0],"OPERATOR_LOCAL_CAPTURE")
            self.assertIn("𝌋".encode("utf8"),rows[1])
        repo=self.private/"repo"
        for estate in ("SRC","EMSTD613"):
            folder=repo/u.BASE/estate/"03-DERIVATIVES"/"text"
            folder.mkdir(parents=True)
            (folder/"invented.txt").write_text("Unrelated invented instrument",encoding="utf8")
        matched=u.exact_query(u.load_sources(db,repo),"archived glyph",estate="WENDBINE")
        self.assertEqual(len(matched),1)
        self.assertEqual(matched[0]["source_id"],"reddit:t3_abcde1")
        self.assertEqual(matched[0]["source_kind"],
            "OPERATOR_LOCAL_CAPTURE_BYTES_NOT_PLATFORM_AUTHENTICATED")

    def test_resume_reuses_verified_batch_without_refetch(self):
        attempts=[]
        def interrupted(url):
            attempts.append(url)
            if len(attempts)==2:raise ConnectionError("OFFLINE_TRANSIENT")
            return self.fake(url)
        with self.assertRaisesRegex(ConnectionError,"OFFLINE_TRANSIENT"):
            h.hydrate(self.manifest,self.private,batch_size=2,
                     fetch=interrupted,clock=self.clock)
        self.assertEqual(len(list((self.private/"archive-batches").glob("*.receipt.json"))),1)
        resumed=[]
        def remaining(url):
            resumed.append(url)
            return self.fake(url)
        result=h.hydrate(self.manifest,self.private,batch_size=2,resume=True,
                         fetch=remaining,clock=self.clock)
        self.assertEqual(len(resumed),1)
        self.assertEqual(result["held_or_unreturned_sources"],1)
        with self.assertRaisesRegex(ValueError,"FINAL_CAPTURE_MANIFEST_ALREADY_PRESENT"):
            h.hydrate(self.manifest,self.private,batch_size=2,resume=True,
                      fetch=remaining,clock=self.clock)

    def test_tampered_batch_and_manifest_fail_closed(self):
        with self.assertRaises(ConnectionError):
            def fail_second(url):
                if "abcde3" in url:raise ConnectionError("BREAK")
                return self.fake(url)
            h.hydrate(self.manifest,self.private,batch_size=2,fetch=fail_second,clock=self.clock)
        raw=self.private/"archive-batches"/"0000.json"
        raw.write_bytes(raw.read_bytes()+b" ")
        with self.assertRaisesRegex(ValueError,"RESUMED_PROVIDER_BATCH_IDENTITY_DRIFT"):
            h.hydrate(self.manifest,self.private,batch_size=2,resume=True,
                      fetch=self.fake,clock=self.clock)
        self.manifest.write_bytes(self.manifest.read_bytes()+b"\n")
        with self.assertRaisesRegex(ValueError,"PINNED_WENDBINE_MANIFEST_SHA_MISMATCH"):
            h.manifest_ids(self.manifest)

    def test_rejects_duplicate_or_unrequested_provider_ids(self):
        with self.assertRaisesRegex(ValueError,"DUPLICATE_ARCHIVE_SOURCE_ID_REFUSED"):
            h.parse_batch(h.encoded([p("abcde1","a"),p("abcde1","b")]),IDS[:2])
        with self.assertRaisesRegex(ValueError,"EXTRANEOUS_ARCHIVE_SOURCE_ID_REFUSED"):
            h.parse_batch(h.encoded([p("abcde4","wrong slice")]),IDS[:2])
        with self.assertRaisesRegex(ValueError,"DUPLICATE_PROVIDER_OR_MANIFEST_JSON_KEY"):
            h.parse_batch(b'{"data":[],"data":[]}',IDS[:2])
        with self.assertRaisesRegex(ValueError,"UNRECOGNIZED_ARCHIVE_ID_RESPONSE"):
            h.parse_batch(b'{"unexpected":"shape"}',IDS[:2])

    def test_wrong_author_and_malformed_text_are_not_promoted(self):
        wrong=p("abcde1","Reported post",author="OtherWriter")
        result,state=h.post_to_capture("reddit:t3_abcde1",wrong,
            "2026-11-04T15:00:00Z","https://archive.example/ids",0)
        self.assertIsNone(result)
        self.assertEqual(state,"AUTHOR_OR_SUBREDDIT_MISMATCH")
        malformed=p("abcde2","a");malformed["selftext"]={"text":"not a body"}
        result,state=h.post_to_capture("reddit:t3_abcde2",malformed,
            "2026-11-04T15:00:00Z","https://archive.example/ids",0)
        self.assertIsNone(result);self.assertEqual(state,"ARCHIVE_BODY_NOT_TEXT")
        with self.assertRaisesRegex(ValueError,"BOUNDED_MANIFEST_ID_BATCH_SIZE_REQUIRED"):
            h.hydrate(self.manifest,self.private,batch_size=501,fetch=self.fake)

if __name__=="__main__":unittest.main()

"""Time-bound independent archive ID discovery; synthetic only."""
import datetime as dt
import importlib.util
import json
import tempfile
import unittest
import urllib.parse
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("td613_wendbine_discover",
    ROOT/"scripts"/"wendbine-archive-discover-source-ids-v1.py")
d=importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)
PUB1=int(dt.datetime(2026,9,7,tzinfo=dt.timezone.utc).timestamp())
PUB2=int(dt.datetime(2026,9,8,tzinfo=dt.timezone.utc).timestamp())
OB=dt.datetime(2026,11,4,15,tzinfo=dt.timezone.utc)

def post(sid,t=PUB1,author="Upset-Ratio502"):
    return {"id":sid,"author":author,"subreddit":"Wendbine","created_utc":t,
       "title":"Invented discovery fixture 𝌋","selftext":"Invented text"}

class ArchiveDiscovery(unittest.TestCase):
    def setUp(self):
        tmp=tempfile.TemporaryDirectory();self.addCleanup(tmp.cleanup)
        self.root=Path(tmp.name)
        self.manifest=self.root/"pinned.jsonl"
        known=["reddit:t3_abcde1","reddit:t3_abcde2"]
        raw=b"".join(d.h.encoded({"schema":"wendbine-manifestation/v1",
             "platform_account":"Upset-Ratio502","subreddit":"Wendbine",
             "source_id":sid})+b"\n" for sid in known)
        self.manifest.write_bytes(raw)
        self.pin=patch.multiple(d.h,MANIFEST_SHA=d.h.sha(raw),SOURCE_COUNT=len(known))
        self.pin.start();self.addCleanup(self.pin.stop)
        self.workspace=self.root/"discovery"
        self.start="2026-09-06T00:00:00Z"
        self.end="2026-09-09T00:00:00Z"

    def test_earlier_sources_and_overlap_are_independent_from_pinned_registry(self):
        seen=[]
        def fetch(url):
            seen.append(url)
            q=urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
            self.assertEqual(q["author"],["Upset-Ratio502"])
            self.assertEqual(q["subreddit"],["Wendbine"])
            self.assertEqual(q["sort"],["asc"])
            return d.h.encoded({"data":[post("pre2026",PUB1),
                       post("abcde1",PUB2),post("bad002",PUB2,"Different") ]})
        report=d.discover(self.manifest,self.workspace,since=self.start,
             until=self.end,fetch=fetch,clock=lambda:OB)
        self.assertEqual(report["source_ids_outside_manifest"],1)
        self.assertEqual(report["provider_calls"],1)
        self.assertEqual(len(seen),1)
        record=json.loads((self.workspace/"extra-ids.json").read_text("utf8"))
        self.assertEqual(record["source_ids"],["reddit:t3_pre2026"])
        self.assertEqual(record["observed_ids_in_pinned_manifest"],1)
        self.assertEqual(record["invalid_identity_observations"][0]["reason"],
                         "RETURNED_AUTHOR_OR_COMMUNITY_MISMATCH")
        extras,held=d.h.extra_discovered_ids([self.workspace/"extra-ids.json"],
                                              ["reddit:t3_abcde1","reddit:t3_abcde2"])
        self.assertEqual(extras,["reddit:t3_pre2026"])
        self.assertEqual(held,0)
        self.assertFalse(record["complete_historical_catalog_proven"])

    def test_dense_one_second_interval_is_reported_not_asserted_complete(self):
        one="2026-09-07T00:00:00Z"
        second="2026-09-07T00:00:01Z"
        t=d.seconds(one)
        def fetch(url):
            # An adversarial archive can return LIMIT objects from a single second.
            return d.h.encoded({"data":[post(f"{x:05x}",t) for x in range(100)]})
        report=d.discover(self.manifest,self.workspace,since=one,
            until=second,fetch=fetch,clock=lambda:OB)
        self.assertEqual(report["saturated_one_second_intervals"],1)
        self.assertEqual(report["source_ids_outside_manifest"],100)
        rec=json.loads((self.workspace/"extra-ids.json").read_text("utf8"))
        self.assertEqual(rec["saturated_one_second_intervals"][0]["reason"],
                         "ONE_SECOND_SEARCH_RESULT_SATURATION")
        self.assertFalse(rec["complete_historical_catalog_proven"])

    def test_resume_protects_previous_search_response_hash(self):
        def fetch(_url):
            return d.h.encoded([post("pre2026",PUB1)])
        with patch.object(d.h,"atomic_bytes",wraps=d.h.atomic_bytes):
            d.discover(self.manifest,self.workspace,since=self.start,until=self.end,
                fetch=fetch,clock=lambda:OB)
        pair=next((self.workspace/"search-responses").glob("*.json"))
        # Avoid selecting receipt file when tampering:
        pair=next(x for x in (self.workspace/"search-responses").glob("*.json")
                  if not x.name.endswith(".receipt.json"))
        pair.write_bytes(pair.read_bytes()+b" ")
        (self.workspace/"extra-ids.json").unlink()
        with self.assertRaisesRegex(ValueError,"SEARCH_RESUME_IDENTITY_DRIFT"):
            d.discover(self.manifest,self.workspace,since=self.start,
               until=self.end,resume=True,fetch=fetch,clock=lambda:OB)

    def test_unpinned_manifest_is_rejected_prior_to_archive_calls(self):
        self.manifest.write_bytes(self.manifest.read_bytes()+b" ")
        with self.assertRaisesRegex(ValueError,"PINNED_WENDBINE_MANIFEST_SHA_MISMATCH"):
            d.discover(self.manifest,self.workspace,since=self.start,until=self.end,
                       fetch=lambda _u: (_ for _ in ()).throw(AssertionError("NETWORK")))

if __name__=="__main__":unittest.main()

"""BRAID G3: original native cross-estate span identity and source-class refusal.
Constructed synthetic bytes are fixtures, not historic SRC/Em acquisition.
"""
import hashlib
import importlib.util
import json
import pathlib
import tempfile
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
def module(name,rel):
    spec=importlib.util.spec_from_file_location(name,ROOT/"scripts"/rel)
    obj=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(obj)
    return obj

query=module("braid_g3_query","atelier-cross-estate-query-v1.py")
cross=module("braid_g3_cross","atelier-source-crosswalk-v1.py")
def digest(v):return hashlib.sha256(v).hexdigest()

class Gate3SpanIdentity(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=pathlib.Path(self.temp.name)
        for relative,rows in (
            (cross.EM_DERIV,[{"source_file_id":"emsrc_fixture",
              "derivative_relative_path":"03-DERIVATIVES/text/emsrc_fixture.txt",
              "derivative_sha256":"a"*64}]),
            (cross.EM_LINKS,[{"source_file_id":"emsrc_fixture",
              "work_id":"emwork_fixture","relation":"MANIFESTATION_OF",
              "identity_status":"HUMAN_REVIEW_REQUIRED",
              "human_gate_required":True}])
        ):
            target=self.root/relative
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text("".join(json.dumps(row)+"\n" for row in rows),encoding="utf8")
    def tearDown(self):self.temp.cleanup()
    def srcrow(self):
        raw=("The source-route distinction survives each independent paragraph. "*25).encode()
        return {"estate":"SRC","source_id":"derivative:03-DERIVATIVES/text/zenodo/zenodo-18096652-file-0.md",
            "source_kind":"SYNTHETIC_NEGATIVE_CONTROL_NOT_ORIGINAL","relative_path":"fixture.txt",
            "bytes":raw,"sha256":digest(raw),"capture_id":None,
            "original_source_bytes_verified":False}
    def test_distinct_span_commitments_survive_crosswalk(self):
        row=self.srcrow()
        short=list(query.source_chunks(iter([row]),max_chars=200,overlap=50))[0]
        long=list(query.source_chunks(iter([row]),max_chars=400,overlap=50))[0]
        self.assertEqual(short["source_id"],long["source_id"])
        self.assertEqual(short["source_sha256"],long["source_sha256"])
        self.assertEqual(short["byte_offset"],long["byte_offset"])
        self.assertNotEqual(short["chunk_id"],long["chunk_id"])
        self.assertNotEqual(short["chunk_sha256"],long["chunk_sha256"])
        annotated=cross.annotate([short,long],self.root)["results"]
        self.assertNotEqual(annotated[0]["span_commitment_sha256"],
            annotated[1]["span_commitment_sha256"])
        self.assertEqual([x["source_span_receipt"]["byte_length"] for x in annotated],[200,400])
        for x in annotated:
            self.assertEqual(x["source_span_status"],"DERIVATIVE_SPAN_RECEIPT_BOUNDED")
            self.assertFalse(x["source_span_receipt"]["external_origin_proven"])
            self.assertFalse(x["source_span_receipt"]["original_source_bytes_verified"])
            self.assertFalse(x["research_braid_envelope"]["cross_estate_method_equivalence_proven"])
            self.assertEqual(x["research_braid_envelope"]["empirical_replication_credit"],0)
    def test_missing_span_holds_without_overwriting_original_rights(self):
        short=list(query.source_chunks(iter([self.srcrow()]),max_chars=200,overlap=50))[0]
        short.pop("chunk_sha256")
        item=cross.annotate([short],self.root)["results"][0]
        self.assertEqual(item["source_span_status"],"HELD_SPAN_NOT_VERIFIED")
        self.assertIsNone(item["source_span_receipt"])
        self.assertIsNone(item["span_commitment_sha256"])
        self.assertFalse(item["research_braid_envelope"]["original_source_admission"])
    def test_wendbine_capture_time_rights_and_method_discriminants(self):
        row=self.srcrow()
        body=b"Wendbine historical synthetic capture. "*18
        title=b"synthetic title"
        row.update({"estate":"WENDBINE","source_id":"reddit:t3_abcde1",
         "source_kind":"OPERATOR_LOCAL_CAPTURE_BYTES_NOT_PLATFORM_AUTHENTICATED",
         "capture_id":"cap_fixture_2","captured_at_utc":"2026-11-20T15:00:00Z",
         "later_visibility_state":"LATER_FILTERED","capture_manifest_sha256":"f"*64,
         "canonical_url":"https://example.invalid/fixture","bytes":body,
         "sha256":digest(body),"title":title,"title_sha256":digest(title),
         "capture_bytes_verified":True,"original_source_bytes_verified":False})
        first=list(query.source_chunks(iter([row]),max_chars=200,overlap=50))[0]
        self.assertEqual(first["capture_at"],"2026-11-20T15:00:00Z")
        item=cross.annotate([first],self.root)["results"][0]
        self.assertEqual(item["source_span_receipt"]["capture_at"],"2026-11-20T15:00:00Z")
        self.assertEqual(item["research_braid_envelope"]["observation_time"],"2026-11-20T15:00:00Z")
        self.assertEqual(item["capture_visibility_state"],"LATER_FILTERED")
        self.assertTrue(item["source_span_receipt"]["retrieved_capture_bytes_verified"])
        self.assertFalse(item["source_span_receipt"]["original_source_bytes_verified"])
        self.assertFalse(item["research_braid_envelope"]["original_performer_authorship_proven"])
    def test_em_human_gate_and_derivative_id_uncertainty(self):
        hit={"estate":"EMSTD613",
          "source_id":"derivative:03-DERIVATIVES/text/emsrc_fixture.txt",
          "source_sha256":"a"*64,"byte_offset":0,"byte_length":40,
          "byte_end_exclusive":40,"chunk_sha256":"c"*64,
          "chunk_id":"chunk:fixture","source_field":"body"}
        result=cross.annotate([hit],self.root)["results"][0]
        self.assertEqual(result["em_source_file_id"],"emsrc_fixture")
        self.assertTrue(result["candidate_works"][0]["human_gate_required"])
        self.assertTrue(result["identity_uncertainty_preserved"])
        self.assertEqual(result["source_span_status"],"DERIVATIVE_SPAN_RECEIPT_BOUNDED")
        self.assertFalse(result["research_braid_envelope"]["cross_estate_method_equivalence_proven"])

if __name__=="__main__": unittest.main()

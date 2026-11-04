import importlib.util
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE="packages/dome_world_exact/fixtures/a15-r0"
SRC_SHA="b3e69acf587d534eeef2e01d0bb5bdbdecdbd320"
EM_SHA="70b5a0f9e94626cba6068f41c6117e7978800bbd"
spec=importlib.util.spec_from_file_location("atelier_native_inheritance",
    ROOT/"scripts"/"atelier-native-inheritance-bridge-v1.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def materialize(estate,sha,root,relpath):
    path=f"{BASE}/{estate}/{relpath}"
    blob=subprocess.check_output(["git","show",f"{sha}:{path}"],cwd=ROOT,timeout=25)
    dest=root/relpath
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(blob)
    return hashlib.sha256(blob).hexdigest()

class NativeIndependentPreservation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        cls.src=Path(cls.temp.name)/"SRC"
        cls.em=Path(cls.temp.name)/"EMSTD613"
        cls.src.mkdir();cls.em.mkdir()
        src_paths=list(m.SRC_METHODS.values())+[
          "04-RECEIPTS/phase2/current-seal.json",
          "04-RECEIPTS/phase2/projection-seal.json",
          "01-MANIFESTS/phase2/acquisition-outcomes.jsonl",
          "05-OPERATIONS/phase2/expected-object-observations.jsonl",
          "05-OPERATIONS/phase2/compilation-passes.jsonl",
          "05-OPERATIONS/phase2/evidence-lineage-assertions.jsonl",
          "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl",
          "04-RECEIPTS/assays/2026-08-24-phase2-kiln/coverage-ledger.jsonl",
          "01-MANIFESTS/phase2/entity-resolver-v2.jsonl"]
        cls.src_hashes={p:materialize("SRC",SRC_SHA,cls.src,p) for p in set(src_paths)}
        cls.em_hashes={p:materialize("EMSTD613",EM_SHA,cls.em,p)
                       for p in set(m.EM_FIXTURES.values())}
    @classmethod
    def tearDownClass(cls):cls.temp.cleanup()

    def test_real_pinned_src_native_query_epoch_compiler_summary(self):
        current=json.loads((self.src/"04-RECEIPTS/phase2/current-seal.json").read_text("utf8"))
        rec=m.native_src_query(self.src,current["atelier_snapshot_id"],current["seal_id"],
                               "summary",expected_source_sha=self.src_hashes[m.SRC_METHODS["src_query"]])
        self.assertEqual(rec["method"],"ORIGINAL_NATIVE_SRCQUERY_EXECUTED")
        self.assertEqual(rec["method_sha256"],self.src_hashes["99-ADMIN/srcquery.py"])
        self.assertGreater(rec["result"]["compiler_map"]["compilation_passes"],0)
        with self.assertRaisesRegex(ValueError,"EXACT_NATIVE_SRC_QUERY_SHA256_REQUIRED"):
            m.native_src_query(self.src,current["atelier_snapshot_id"],current["seal_id"],
                               "summary",expected_source_sha="0"*64)

    def test_native_src_map_heterostrata_topology_and_tomography_real_records(self):
        for projection in ("CARTOGRAPHIC","RELATIONAL_TOPOLOGY",
                           "HETEROSTRATIGRAPHIC_CONTEXT_ROLES","TOMOGRAPHIC_EVIDENCE"):
            report=m.native_projection(self.src,projection,limit=2)
            self.assertGreater(report["returned"],0,projection)
            rel=m.SRC_METHODS[m.PROJECTIONS[projection]]
            self.assertEqual(report["registry_sha256"],self.src_hashes[rel])
            self.assertFalse(report["scientific_topology_established"])
            self.assertEqual(report["query"],"FIRST_N_NATIVE_ROWS")
        empty=m.native_projection(self.src,"RELATIONAL_TOPOLOGY",term="NO_SUCH_SOURCE_IDENTIFIER")
        self.assertEqual(empty["returned"],0)
        self.assertRaises(ValueError,m.native_projection,self.src,"FAKE_TOPOLOGY")

    def test_em_actual_identity_lineage_and_null_controls_retained_without_false_equality(self):
        c=m.census(self.src,self.em)
        self.assertEqual(c["estates"]["SRC"]["present"],len(m.SRC_METHODS))
        self.assertEqual(c["estates"]["EMSTD613"]["present"],len(m.EM_FIXTURES))
        self.assertEqual(c["em_full_original_corpus_parity"],"HELD")
        e=m.em_fixture(self.em,"em_identity")
        self.assertEqual(e["fixture_status"],"SOURCE_CUSTODY_ESTABLISHED") if "fixture_status" in e else self.assertEqual(e["value"]["fixture_status"],"SOURCE_CUSTODY_ESTABLISHED")
        self.assertEqual(e["sha256"],self.em_hashes[m.EM_FIXTURES["em_identity"]])
        self.assertFalse(e["value"]["work_identity_state"]["WORK_IDENTITY_FULLY_RESOLVED"])
        line=m.em_fixture(self.em,"em_lineage_protocol")
        self.assertIn("Stage 5 — topology",line["value"]["document_utf8"])
        self.assertFalse(line["original_method_executed"])
        schema=m.em_fixture(self.em,"em_typed_schema")
        self.assertIn("NOT_EXTRACTED",schema["value"]["document_utf8"])
        self.assertIn("UNRESOLVED_IDENTITY",schema["value"]["document_utf8"])
        self.assertFalse(schema["human_adjudication"]=="ADOPTED")
        control=m.em_fixture(self.em,"em_negative_control")
        self.assertGreater(control["value"]["record_count"],0)
        self.assertFalse(control["original_method_executed"])

    def test_originals_remain_unmodified_and_native_roots_not_interchangeable(self):
        for root,hashes in [(self.src,self.src_hashes),(self.em,self.em_hashes)]:
            for relative,h in hashes.items():
                self.assertEqual(hashlib.sha256((root/relative).read_bytes()).hexdigest(),h)
        self.assertRaisesRegex(ValueError,"PINNED_NATIVE_SRC_ROOT_REQUIRED",
            m.root_check,self.em,"SRC")
        self.assertRaisesRegex(ValueError,"NATIVE_FIXTURE_MISSING",
            m.native_projection,Path(self.temp.name)/"SRC-missing","CARTOGRAPHIC")

if __name__=="__main__":unittest.main()
